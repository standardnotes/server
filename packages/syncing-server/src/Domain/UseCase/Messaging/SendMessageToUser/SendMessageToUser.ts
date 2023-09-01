import { Result, Timestamps, UseCaseInterface, Uuid, Validator } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

import { SendMessageToUserDTO } from './SendMessageToUserDTO'
import { MessageRepositoryInterface } from '../../../Message/MessageRepositoryInterface'
import { Message } from '../../../Message/Message'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'
import { SendEventToClient } from '../../Syncing/SendEventToClient/SendEventToClient'
import { Logger } from 'winston'

export class SendMessageToUser implements UseCaseInterface<Message> {
  constructor(
    private messageRepository: MessageRepositoryInterface,
    private timer: TimerInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private sendEventToClientUseCase: SendEventToClient,
    private logger: Logger,
  ) {}

  async execute(dto: SendMessageToUserDTO): Promise<Result<Message>> {
    const recipientUuidOrError = Uuid.create(dto.recipientUuid)
    if (recipientUuidOrError.isFailed()) {
      return Result.fail(recipientUuidOrError.getError())
    }
    const recipientUuid = recipientUuidOrError.getValue()

    const senderUuidOrError = Uuid.create(dto.senderUuid)
    if (senderUuidOrError.isFailed()) {
      return Result.fail(senderUuidOrError.getError())
    }
    const senderUuid = senderUuidOrError.getValue()

    const validateNotEmptyMessage = Validator.isNotEmpty(dto.encryptedMessage)
    if (validateNotEmptyMessage.isFailed()) {
      return Result.fail(validateNotEmptyMessage.getError())
    }

    if (dto.replaceabilityIdentifier) {
      const existingMessage = await this.messageRepository.findByRecipientUuidAndReplaceabilityIdentifier({
        recipientUuid,
        replaceabilityIdentifier: dto.replaceabilityIdentifier,
      })

      if (existingMessage) {
        await this.messageRepository.remove(existingMessage)
      }
    }

    const messageOrError = Message.create({
      recipientUuid,
      senderUuid,
      encryptedMessage: dto.encryptedMessage,
      timestamps: Timestamps.create(
        this.timer.getTimestampInMicroseconds(),
        this.timer.getTimestampInMicroseconds(),
      ).getValue(),
      replaceabilityIdentifier: dto.replaceabilityIdentifier ?? null,
    })
    if (messageOrError.isFailed()) {
      return Result.fail(messageOrError.getError())
    }
    const message = messageOrError.getValue()

    await this.messageRepository.save(message)

    const event = this.domainEventFactory.createMessageSentToUserEvent({
      message: {
        uuid: message.id.toString(),
        recipient_uuid: message.props.recipientUuid.value,
        sender_uuid: message.props.senderUuid.value,
        encrypted_message: message.props.encryptedMessage,
        replaceability_identifier: message.props.replaceabilityIdentifier,
        created_at_timestamp: message.props.timestamps.createdAt,
        updated_at_timestamp: message.props.timestamps.updatedAt,
      },
    })

    const result = await this.sendEventToClientUseCase.execute({
      userUuid: message.props.recipientUuid.value,
      event,
    })
    if (result.isFailed()) {
      this.logger.error(
        `Failed to send message sent event to client for user ${
          message.props.recipientUuid.value
        }: ${result.getError()}`,
      )
    }

    return Result.ok(message)
  }
}

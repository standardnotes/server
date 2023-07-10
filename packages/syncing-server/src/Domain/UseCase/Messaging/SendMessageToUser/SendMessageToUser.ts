import { Result, Timestamps, UseCaseInterface, Uuid, Validator } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

import { SendMessageToUserDTO } from './SendMessageToUserDTO'
import { MessageRepositoryInterface } from '../../../Message/MessageRepositoryInterface'
import { Message } from '../../../Message/Message'

export class SendMessageToUser implements UseCaseInterface<Message> {
  constructor(private messageRepository: MessageRepositoryInterface, private timer: TimerInterface) {}

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

    return Result.ok(message)
  }
}

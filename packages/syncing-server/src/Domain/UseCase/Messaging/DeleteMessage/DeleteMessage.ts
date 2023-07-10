import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { MessageRepositoryInterface } from '../../../Message/MessageRepositoryInterface'
import { DeleteMessageDTO } from './DeleteMessageDTO'

export class DeleteMessage implements UseCaseInterface<void> {
  constructor(private messageRepository: MessageRepositoryInterface) {}

  async execute(dto: DeleteMessageDTO): Promise<Result<void>> {
    const originatorUuidOrError = Uuid.create(dto.originatorUuid)
    if (originatorUuidOrError.isFailed()) {
      return Result.fail(originatorUuidOrError.getError())
    }
    const originatorUuid = originatorUuidOrError.getValue()

    const messageUuidOrError = Uuid.create(dto.messageUuid)
    if (messageUuidOrError.isFailed()) {
      return Result.fail(messageUuidOrError.getError())
    }
    const messageUuid = messageUuidOrError.getValue()

    const message = await this.messageRepository.findByUuid(messageUuid)
    if (!message) {
      return Result.fail('Message not found')
    }

    const isSentByOriginator = message.props.senderUuid.equals(originatorUuid)
    const isSentToOriginator = message.props.recipientUuid.equals(originatorUuid)

    if (!isSentByOriginator && !isSentToOriginator) {
      return Result.fail('Not authorized to delete this message')
    }

    await this.messageRepository.remove(message)

    return Result.ok()
  }
}

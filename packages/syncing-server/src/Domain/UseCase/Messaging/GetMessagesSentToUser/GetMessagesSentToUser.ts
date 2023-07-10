import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { Message } from '../../../Message/Message'
import { MessageRepositoryInterface } from '../../../Message/MessageRepositoryInterface'
import { GetMessagesSentToUserDTO } from './GetMessagesSentToUserDTO'

export class GetMessagesSentToUser implements UseCaseInterface<Message[]> {
  constructor(private messageRepository: MessageRepositoryInterface) {}

  async execute(dto: GetMessagesSentToUserDTO): Promise<Result<Message[]>> {
    const recipientUuidOrError = Uuid.create(dto.recipientUuid)
    if (recipientUuidOrError.isFailed()) {
      return Result.fail(recipientUuidOrError.getError())
    }
    const recipientUuid = recipientUuidOrError.getValue()

    const messages = await this.messageRepository.findByRecipientUuid(recipientUuid)

    return Result.ok(messages)
  }
}

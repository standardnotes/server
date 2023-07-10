import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { Message } from '../../../Message/Message'
import { MessageRepositoryInterface } from '../../../Message/MessageRepositoryInterface'
import { GetMessagesSentByUserDTO } from './GetMessagesSentByUserDTO'

export class GetMessagesSentByUser implements UseCaseInterface<Message[]> {
  constructor(private messageRepository: MessageRepositoryInterface) {}

  async execute(dto: GetMessagesSentByUserDTO): Promise<Result<Message[]>> {
    const senderUuidOrError = Uuid.create(dto.senderUuid)
    if (senderUuidOrError.isFailed()) {
      return Result.fail(senderUuidOrError.getError())
    }
    const senderUuid = senderUuidOrError.getValue()

    const messages = await this.messageRepository.findBySenderUuid(senderUuid)

    return Result.ok(messages)
  }
}

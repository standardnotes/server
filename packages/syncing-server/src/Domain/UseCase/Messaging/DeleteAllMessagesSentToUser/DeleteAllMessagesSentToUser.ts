import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { DeleteAllMessagesSentToUserDTO } from './DeleteAllMessagesSentToUserDTO'
import { DeleteMessage } from '../DeleteMessage/DeleteMessage'
import { MessageRepositoryInterface } from '../../../Message/MessageRepositoryInterface'

export class DeleteAllMessagesSentToUser implements UseCaseInterface<void> {
  constructor(private messageRepository: MessageRepositoryInterface, private deleteMessageUseCase: DeleteMessage) {}

  async execute(dto: DeleteAllMessagesSentToUserDTO): Promise<Result<void>> {
    const recipientUuidOrError = Uuid.create(dto.recipientUuid)
    if (recipientUuidOrError.isFailed()) {
      return Result.fail(recipientUuidOrError.getError())
    }
    const recipientUuid = recipientUuidOrError.getValue()

    const messages = await this.messageRepository.findByRecipientUuid(recipientUuid)

    for (const message of messages) {
      const result = await this.deleteMessageUseCase.execute({
        originatorUuid: recipientUuid.value,
        messageUuid: message.id.toString(),
      })
      if (result.isFailed()) {
        return Result.fail(result.getError())
      }
    }

    return Result.ok()
  }
}

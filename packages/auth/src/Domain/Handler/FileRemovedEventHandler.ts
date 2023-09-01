import { DomainEventHandlerInterface, FileRemovedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { UpdateStorageQuotaUsedForUser } from '../UseCase/UpdateStorageQuotaUsedForUser/UpdateStorageQuotaUsedForUser'

export class FileRemovedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private updateStorageQuotaUsedForUserUseCase: UpdateStorageQuotaUsedForUser,
    private logger: Logger,
  ) {}

  async handle(event: FileRemovedEvent): Promise<void> {
    const result = await this.updateStorageQuotaUsedForUserUseCase.execute({
      userUuid: event.payload.userUuid,
      bytesUsed: -event.payload.fileByteSize,
    })

    if (result.isFailed()) {
      this.logger.error(`Failed to update storage quota used for user: ${result.getError()}`)
    }
  }
}

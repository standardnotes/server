import { DomainEventHandlerInterface, FileQuotaRecalculatedEvent } from '@standardnotes/domain-events'
import { UpdateStorageQuotaUsedForUser } from '../UseCase/UpdateStorageQuotaUsedForUser/UpdateStorageQuotaUsedForUser'
import { Logger } from 'winston'

export class FileQuotaRecalculatedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private updateStorageQuota: UpdateStorageQuotaUsedForUser,
    private logger: Logger,
  ) {}

  async handle(event: FileQuotaRecalculatedEvent): Promise<void> {
    this.logger.info('Updating storage quota for user...', {
      userId: event.payload.userUuid,
      codeTag: 'FileQuotaRecalculatedEventHandler',
    })

    const result = await this.updateStorageQuota.execute({
      userUuid: event.payload.userUuid,
      bytesUsed: event.payload.totalFileByteSize,
    })

    if (result.isFailed()) {
      this.logger.error('Could not update storage quota', {
        userId: event.payload.userUuid,
        codeTag: 'FileQuotaRecalculatedEventHandler',
      })

      return
    }

    this.logger.info('Storage quota updated', {
      userId: event.payload.userUuid,
      codeTag: 'FileQuotaRecalculatedEventHandler',
    })
  }
}

import { DomainEventHandlerInterface, SharedVaultFileMovedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { UpdateStorageQuotaUsedForUser } from '../UseCase/UpdateStorageQuotaUsedForUser/UpdateStorageQuotaUsedForUser'

export class SharedVaultFileMovedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private updateStorageQuotaUsedForUserUseCase: UpdateStorageQuotaUsedForUser,
    private logger: Logger,
  ) {}

  async handle(event: SharedVaultFileMovedEvent): Promise<void> {
    const subtractResult = await this.updateStorageQuotaUsedForUserUseCase.execute({
      userUuid: event.payload.from.ownerUuid,
      bytesUsed: -event.payload.fileByteSize,
    })

    if (subtractResult.isFailed()) {
      this.logger.error(`Failed to update storage quota used for user: ${subtractResult.getError()}`)
    }

    const addResult = await this.updateStorageQuotaUsedForUserUseCase.execute({
      userUuid: event.payload.to.ownerUuid,
      bytesUsed: event.payload.fileByteSize,
    })

    if (addResult.isFailed()) {
      this.logger.error(`Failed to update storage quota used for user: ${addResult.getError()}`)
    }
  }
}

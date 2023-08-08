import { DomainEventHandlerInterface, SharedVaultFileRemovedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { UpdateStorageQuotaUsedForUser } from '../UseCase/UpdateStorageQuotaUsedForUser/UpdateStorageQuotaUsedForUser'

export class SharedVaultFileRemovedEventHandler implements DomainEventHandlerInterface {
  constructor(private updateStorageQuotaUsedForUserUseCase: UpdateStorageQuotaUsedForUser, private logger: Logger) {}

  async handle(event: SharedVaultFileRemovedEvent): Promise<void> {
    const result = await this.updateStorageQuotaUsedForUserUseCase.execute({
      userUuid: event.payload.vaultOwnerUuid,
      bytesUsed: -event.payload.fileByteSize,
    })

    if (result.isFailed()) {
      this.logger.error(`Failed to update storage quota used for user: ${result.getError()}`)
    }
  }
}

import { DomainEventHandlerInterface, SharedVaultFileUploadedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { UpdateStorageQuotaUsedInSharedVault } from '../UseCase/SharedVaults/UpdateStorageQuotaUsedInSharedVault/UpdateStorageQuotaUsedInSharedVault'

export class SharedVaultFileUploadedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private updateStorageQuotaUsedInSharedVaultUseCase: UpdateStorageQuotaUsedInSharedVault,
    private logger: Logger,
  ) {}

  async handle(event: SharedVaultFileUploadedEvent): Promise<void> {
    const result = await this.updateStorageQuotaUsedInSharedVaultUseCase.execute({
      sharedVaultUuid: event.payload.sharedVaultUuid,
      bytesUsed: event.payload.fileByteSize,
    })

    if (result.isFailed()) {
      this.logger.error(`Failed to update storage quota used in shared vault: ${result.getError()}`)
    }
  }
}

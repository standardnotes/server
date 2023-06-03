import { DomainEventHandlerInterface, SharedVaultFileUploadedEvent } from '@standardnotes/domain-events'

import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { SharedVaultServiceInterface } from '../SharedVault/Service/SharedVaultServiceInterface'
import { SharedVaultsRepositoryInterface } from '../SharedVault/Repository/SharedVaultRepositoryInterface'

@injectable()
export class SharedVaultFileUploadedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.SharedVaultService) private sharedVaultService: SharedVaultServiceInterface,
    @inject(TYPES.SharedVaultRepository) private sharedVaultRepository: SharedVaultsRepositoryInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async handle(event: SharedVaultFileUploadedEvent): Promise<void> {
    const sharedVault = await this.sharedVaultService.getSharedVault({
      sharedVaultUuid: event.payload.sharedVaultUuid,
    })

    if (sharedVault === null) {
      this.logger.warn(`Could not find shared vault with uuid: ${event.payload.sharedVaultUuid}`)

      return
    }

    sharedVault.fileUploadBytesUsed += event.payload.fileByteSize

    await this.sharedVaultRepository.save(sharedVault)
  }
}

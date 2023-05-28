import { DomainEventHandlerInterface, VaultFileRemovedEvent } from '@standardnotes/domain-events'

import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { VaultServiceInterface } from '../Vault/Service/VaultServiceInterface'
import { VaultsRepositoryInterface } from '../Vault/Repository/VaultRepositoryInterface'

@injectable()
export class VaultFileRemovedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.VaultService) private vaultService: VaultServiceInterface,
    @inject(TYPES.VaultRepository) private vaultRepository: VaultsRepositoryInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async handle(event: VaultFileRemovedEvent): Promise<void> {
    const vault = await this.vaultService.getVault({
      vaultUuid: event.payload.vaultUuid,
    })

    if (vault === null) {
      this.logger.warn(`Could not find vault with uuid: ${event.payload.vaultUuid}`)

      return
    }

    vault.fileUploadBytesUsed -= event.payload.fileByteSize

    await this.vaultRepository.save(vault)
  }
}

import { TimerInterface } from '@standardnotes/time'
import { VaultFactoryInterface } from './VaultFactoryInterface'
import { VaultHash } from './VaultHash'
import { Vault } from '../Model/Vault'

export class VaultFactory implements VaultFactoryInterface {
  constructor(private timer: TimerInterface) {}

  create(dto: { userUuid: string; vaultHash: VaultHash }): Vault {
    const newVault = new Vault()
    newVault.uuid = dto.vaultHash.uuid
    newVault.userUuid = dto.userUuid
    newVault.specifiedItemsKeyUuid = dto.vaultHash.specified_items_key_uuid
    newVault.vaultKeyTimestamp = dto.vaultHash.vault_key_timestamp
    newVault.fileUploadBytesUsed = dto.vaultHash.file_upload_bytes_used
    newVault.fileUploadBytesLimit = dto.vaultHash.file_upload_bytes_limit

    const now = this.timer.getTimestampInMicroseconds()
    newVault.updatedAtTimestamp = now
    newVault.createdAtTimestamp = now

    if (dto.vaultHash.created_at_timestamp) {
      newVault.createdAtTimestamp = dto.vaultHash.created_at_timestamp
    }

    return newVault
  }

  createStub(dto: { userUuid: string; vaultHash: VaultHash }): Vault {
    const item = this.create(dto)
    return item
  }
}

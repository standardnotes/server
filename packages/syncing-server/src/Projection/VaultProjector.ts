import { Vault } from '../Domain/Vault/Model/Vault'
import { ProjectorInterface } from './ProjectorInterface'
import { VaultProjection } from './VaultProjection'

export class VaultProjector implements ProjectorInterface<Vault, VaultProjection> {
  projectSimple(_vault: Vault): VaultProjection {
    throw Error('not implemented')
  }

  projectCustom(_projectionType: string, vault: Vault): VaultProjection {
    const fullProjection = this.projectFull(vault)

    return {
      ...fullProjection,
      user_uuid: vault.userUuid,
    }
  }

  projectFull(vault: Vault): VaultProjection {
    return {
      uuid: vault.uuid,
      user_uuid: vault.userUuid,
      specified_items_key_uuid: vault.specifiedItemsKeyUuid,
      file_upload_bytes_used: vault.fileUploadBytesUsed,
      file_upload_bytes_limit: vault.fileUploadBytesLimit,
      created_at_timestamp: vault.createdAtTimestamp,
      updated_at_timestamp: vault.updatedAtTimestamp,
    }
  }
}

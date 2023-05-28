import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'
import { ConflictType } from '@standardnotes/responses'
import { VaultUserServiceInterface } from '../../VaultUser/Service/VaultUserServiceInterface'
import { ItemHash } from '../ItemHash'
import { VaultUserPermission } from '../../VaultUser/Model/VaultUserPermission'
import { VaultServiceInterface } from '../../Vault/Service/VaultServiceInterface'
import { ContentType } from '@standardnotes/common'

export class OwnershipFilter implements ItemSaveRuleInterface {
  constructor(private vaultService: VaultServiceInterface, private vaultUserService: VaultUserServiceInterface) {}

  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    const itemBelongsToADifferentUser = dto.existingItem != null && dto.existingItem.userUuid !== dto.userUuid

    const successValue = {
      passed: true,
    }

    const vaultReadonlyFail = {
      passed: false,
      conflict: {
        unsavedItem: dto.itemHash,
        type: ConflictType.ReadOnlyError,
      },
    }

    const ownershipFail = {
      passed: false,
      conflict: {
        unsavedItem: dto.itemHash,
        type: ConflictType.UuidConflict,
      },
    }

    const vaultUuidInvolved = dto.existingItem?.vaultUuid || dto.itemHash.vault_uuid
    if (itemBelongsToADifferentUser && !vaultUuidInvolved) {
      return ownershipFail
    }

    if (vaultUuidInvolved) {
      const vaultAuthorization = await this.vaultAuthorizationForItem(dto.userUuid, vaultUuidInvolved)
      if (!vaultAuthorization) {
        return ownershipFail
      }

      if (vaultAuthorization === 'read') {
        return vaultReadonlyFail
      }

      const isItemBeingRemovedFromVault =
        dto.existingItem != null && dto.existingItem.vaultUuid != null && dto.itemHash.vault_uuid == null

      const isItemBeingDeleted = dto.itemHash.deleted === true

      if (isItemBeingRemovedFromVault || isItemBeingDeleted) {
        if (itemBelongsToADifferentUser) {
          return vaultAuthorization === 'admin' ? successValue : vaultReadonlyFail
        } else {
          return successValue
        }
      }

      if (dto.itemHash.content_type === ContentType.VaultItemsKey && vaultAuthorization !== 'admin') {
        return vaultReadonlyFail
      }

      const usingValidKey = await this.vaultItemIsBeingSavedWithValidItemsKey(dto.itemHash)

      if (!usingValidKey) {
        return {
          passed: false,
          conflict: {
            unsavedItem: dto.itemHash,
            type: ConflictType.ContentError,
          },
        }
      }
    }

    return successValue
  }

  private async vaultItemIsBeingSavedWithValidItemsKey(itemHash: ItemHash): Promise<boolean> {
    const isItemNotEncryptedByItemsKey = itemHash.content_type === ContentType.VaultItemsKey
    if (isItemNotEncryptedByItemsKey) {
      return true
    }

    const vault = await this.vaultService.getVault({ vaultUuid: itemHash.vault_uuid as string })

    if (!vault) {
      return false
    }

    return itemHash.items_key_id === vault.specifiedItemsKeyUuid
  }

  private async vaultAuthorizationForItem(
    userUuid: string,
    vaultUuid: string,
  ): Promise<VaultUserPermission | undefined> {
    const vaultUser = await this.vaultUserService.getUserForVault({
      userUuid,
      vaultUuid: vaultUuid,
    })

    if (vaultUser) {
      return vaultUser.permissions
    }

    return undefined
  }
}

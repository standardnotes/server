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

    const contentFail = {
      passed: false,
      conflict: {
        unsavedItem: dto.itemHash,
        type: ConflictType.ContentError,
      },
    }

    const vaultUuidInvolved = dto.existingItem?.vaultUuid || dto.itemHash.vault_uuid
    if (vaultUuidInvolved) {
      const result = await this.authorizationToSaveVaultInvolvedItem(dto)
      if (result === 'ownership-fail') {
        return ownershipFail
      } else if (result === 'readonly-fail') {
        return vaultReadonlyFail
      } else if (result === 'content-fail') {
        return contentFail
      } else if (result === 'success') {
        return successValue
      } else {
        throw new Error(`Unexpected vault authorization result: ${result}`)
      }
    }

    const itemBelongsToADifferentUser =
      dto.existingItem != null && dto.existingItem.userUuid && dto.existingItem.userUuid !== dto.userUuid
    if (itemBelongsToADifferentUser) {
      return ownershipFail
    }

    return successValue
  }

  private async authorizationToSaveVaultInvolvedItem(
    dto: ItemSaveValidationDTO,
  ): Promise<'ownership-fail' | 'readonly-fail' | 'content-fail' | 'success'> {
    const existingItemVaultUuid = dto.existingItem?.vaultUuid
    const targetItemVaultUuid = dto.itemHash.vault_uuid

    const vaultUuidInvolved = existingItemVaultUuid || targetItemVaultUuid

    const isMovingVaults = existingItemVaultUuid && targetItemVaultUuid && existingItemVaultUuid !== targetItemVaultUuid
    if (isMovingVaults) {
      const existingVaultAuthorization = await this.vaultAuthorizationForItem(dto.userUuid, existingItemVaultUuid)
      const targetVaultAuthorization = await this.vaultAuthorizationForItem(dto.userUuid, targetItemVaultUuid)
      if (!existingVaultAuthorization || !targetVaultAuthorization) {
        return 'ownership-fail'
      }

      if (existingVaultAuthorization === 'read' || targetVaultAuthorization === 'read') {
        return 'readonly-fail'
      }
    }

    const vaultAuthorization = await this.vaultAuthorizationForItem(dto.userUuid, vaultUuidInvolved as string)
    if (!vaultAuthorization) {
      return 'ownership-fail'
    }

    if (vaultAuthorization === 'read') {
      return 'readonly-fail'
    }

    const isItemBeingRemovedFromVault =
      dto.existingItem != null && dto.existingItem.vaultUuid != null && dto.itemHash.vault_uuid == null

    const isItemBeingDeleted = dto.itemHash.deleted === true

    if (isItemBeingRemovedFromVault || isItemBeingDeleted) {
      const doesHavePermissionToRemoveItemFromVault =
        vaultAuthorization === 'admin' || dto.existingItem?.createdByUuid === dto.userUuid

      return doesHavePermissionToRemoveItemFromVault ? 'success' : 'readonly-fail'
    }

    if (dto.itemHash.content_type === ContentType.VaultItemsKey && vaultAuthorization !== 'admin') {
      return 'readonly-fail'
    }

    const usingValidKey = await this.vaultItemIsBeingSavedWithValidItemsKey(dto.itemHash)
    if (!usingValidKey) {
      return 'content-fail'
    }

    return 'success'
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

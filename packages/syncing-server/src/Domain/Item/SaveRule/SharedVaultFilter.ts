import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'
import { SharedVaultUserServiceInterface } from '../../SharedVaultUser/Service/SharedVaultUserServiceInterface'
import { ItemHash } from '../ItemHash'
import { SharedVaultUserPermission } from '../../SharedVaultUser/Model/SharedVaultUserPermission'
import { SharedVaultServiceInterface } from '../../SharedVault/Service/SharedVaultServiceInterface'
import { ContentType } from '@standardnotes/common'
import { ConflictType } from '../../../Tmp/ConflictType'

export class SharedVaultFilter implements ItemSaveRuleInterface {
  constructor(
    private sharedVaultService: SharedVaultServiceInterface,
    private sharedVaultUserService: SharedVaultUserServiceInterface,
  ) {}

  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    if (!dto.existingItem?.sharedVaultUuid) {
      return {
        passed: true,
      }
    }

    const sharedVaultUser = await this.sharedVaultUserService.getUserForSharedVault({
      userUuid: dto.userUuid,
      sharedVaultUuid: dto.existingItem.sharedVaultUuid,
    })

    if (!sharedVaultUser) {
      return {
        passed: false,
        conflict: {
          unsavedItem: dto.itemHash,
          type: ConflictType.SharedVaultNotMemberError,
        },
      }
    }

    if (sharedVaultUser.permissions === 'read') {
      return {
        passed: false,
        conflict: {
          unsavedItem: dto.itemHash,
          serverItem: dto.existingItem,
          type: ConflictType.SharedVaultInsufficientPermissionsError,
        },
      }
    }

    if (!this.isAuthorizedToSaveContentType(dto.itemHash.content_type, sharedVaultUser.permissions)) {
      return {
        passed: false,
        conflict: {
          unsavedItem: dto.itemHash,
          serverItem: dto.existingItem,
          type: ConflictType.SharedVaultInsufficientPermissionsError,
        },
      }
    }

    const usesValidKey = await this.incomingItemUsesValidItemsKey(dto.itemHash, dto.existingItem.sharedVaultUuid)
    if (!usesValidKey) {
      return {
        passed: false,
        conflict: {
          unsavedItem: dto.itemHash,
          serverItem: dto.existingItem,
          type: ConflictType.SharedVaultInvalidItemsKey,
        },
      }
    }

    return {
      passed: true,
    }
  }

  private isAuthorizedToSaveContentType(contentType: ContentType, permissions: SharedVaultUserPermission): boolean {
    if (contentType === ContentType.VaultItemsKey) {
      return permissions === 'admin'
    }

    return true
  }

  private async incomingItemUsesValidItemsKey(itemHash: ItemHash, sharedVaultUuid: string): Promise<boolean> {
    if (itemHash.deleted) {
      return true
    }

    const isItemNotEncryptedByItemsKey = itemHash.content_type === ContentType.VaultItemsKey
    if (isItemNotEncryptedByItemsKey) {
      return true
    }

    const sharedVault = await this.sharedVaultService.getSharedVault({ sharedVaultUuid: sharedVaultUuid })
    if (!sharedVault) {
      return false
    }

    return itemHash.items_key_id === sharedVault.specifiedItemsKeyUuid
  }
}

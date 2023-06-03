import { Item } from '../Item'
import { ItemHash } from '../ItemHash'
import { SharedVaultSaveOperation } from './SharedVaultSaveOperation'

export function GetSharedVaultSaveOperation(dto: {
  userUuid: string
  itemHash: ItemHash
  existingItem: Item | null
}): SharedVaultSaveOperation | undefined {
  const existingItemSharedVaultUuid = dto.existingItem?.sharedVaultUuid
  const targetItemSharedVaultUuid = dto.itemHash.shared_vault_uuid

  if (!existingItemSharedVaultUuid && !targetItemSharedVaultUuid) {
    return undefined
  }

  const common = {
    incomingItem: dto.itemHash,
    userUuid: dto.userUuid,
  }

  if (
    dto.existingItem &&
    existingItemSharedVaultUuid &&
    targetItemSharedVaultUuid &&
    existingItemSharedVaultUuid !== targetItemSharedVaultUuid
  ) {
    return {
      type: 'move-to-other-shared-vault',
      sharedVaultUuid: existingItemSharedVaultUuid,
      targetSharedVaultUuid: targetItemSharedVaultUuid,
      existingItem: dto.existingItem,
      ...common,
    }
  }

  if (dto.existingItem && existingItemSharedVaultUuid && !targetItemSharedVaultUuid) {
    return {
      type: 'remove-from-shared-vault',
      sharedVaultUuid: existingItemSharedVaultUuid,
      existingItem: dto.existingItem,
      ...common,
    }
  }

  if (dto.existingItem && !existingItemSharedVaultUuid && targetItemSharedVaultUuid) {
    return {
      type: 'add-to-shared-vault',
      sharedVaultUuid: targetItemSharedVaultUuid,
      existingItem: dto.existingItem,
      ...common,
    }
  }

  if (dto.existingItem && existingItemSharedVaultUuid && existingItemSharedVaultUuid === targetItemSharedVaultUuid) {
    return {
      type: 'save-to-shared-vault',
      sharedVaultUuid: existingItemSharedVaultUuid,
      existingItem: dto.existingItem,
      ...common,
    }
  }

  if (!dto.existingItem && targetItemSharedVaultUuid) {
    return {
      type: 'create-to-shared-vault',
      sharedVaultUuid: targetItemSharedVaultUuid,
      ...common,
    }
  }

  throw new Error('Invalid save operation')
}

import { ItemHash } from '../ItemHash'
import { Item } from '../Item'

type SaveOperationCommon = {
  incomingItem: ItemHash
  userUuid: string
}

export type AddToVaultSaveOperation = SaveOperationCommon & {
  type: 'add-to-vault'
  vaultUuid: string
  existingItem: Item
}

export type RemoveFromVaultSaveOperation = SaveOperationCommon & {
  type: 'remove-from-vault'
  vaultUuid: string
  existingItem: Item
}

export type MoveToOtherVaultSaveOperation = SaveOperationCommon & {
  type: 'move-to-other-vault'
  sourceVaultUuid: string
  targetVaultUuid: string
  existingItem: Item
}

export type SaveToVaultSaveOperation = SaveOperationCommon & {
  type: 'save-to-vault'
  vaultUuid: string
  existingItem: Item
}

export type CreateToVaultSaveOperation = SaveOperationCommon & {
  type: 'create-to-vault'
  vaultUuid: string
}

export type VaultSaveOperation =
  | AddToVaultSaveOperation
  | RemoveFromVaultSaveOperation
  | MoveToOtherVaultSaveOperation
  | SaveToVaultSaveOperation
  | CreateToVaultSaveOperation

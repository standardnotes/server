import { ItemHash } from '../ItemHash'
import { Item } from '../Item'

type SaveOperationCommon = {
  incomingItem: ItemHash
  userUuid: string
}

export type AddToSharedVaultSaveOperation = SaveOperationCommon & {
  type: 'add-to-shared-vault'
  sharedVaultUuid: string
  existingItem: Item
}

export type RemoveFromSharedVaultSaveOperation = SaveOperationCommon & {
  type: 'remove-from-shared-vault'
  sharedVaultUuid: string
  existingItem: Item
}

export type MoveToOtherSharedVaultSaveOperation = SaveOperationCommon & {
  type: 'move-to-other-shared-vault'
  sharedVaultUuid: string
  targetSharedVaultUuid: string
  existingItem: Item
}

export type SaveToSharedVaultSaveOperation = SaveOperationCommon & {
  type: 'save-to-shared-vault'
  sharedVaultUuid: string
  existingItem: Item
}

export type CreateToSharedVaultSaveOperation = SaveOperationCommon & {
  type: 'create-to-shared-vault'
  sharedVaultUuid: string
}

export type SharedVaultSaveOperation =
  | AddToSharedVaultSaveOperation
  | RemoveFromSharedVaultSaveOperation
  | MoveToOtherSharedVaultSaveOperation
  | SaveToSharedVaultSaveOperation
  | CreateToSharedVaultSaveOperation

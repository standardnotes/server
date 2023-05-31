import { ItemHash } from '../ItemHash'
import { Item } from '../Item'

type SaveOperationCommon = {
  incomingItem: ItemHash
  userUuid: string
}

export type AddToGroupSaveOperation = SaveOperationCommon & {
  type: 'add-to-group'
  groupUuid: string
  existingItem: Item
}

export type RemoveFromGroupSaveOperation = SaveOperationCommon & {
  type: 'remove-from-group'
  groupUuid: string
  existingItem: Item
}

export type MoveToOtherGroupSaveOperation = SaveOperationCommon & {
  type: 'move-to-other-group'
  groupUuid: string
  targetGroupUuid: string
  existingItem: Item
}

export type SaveToGroupSaveOperation = SaveOperationCommon & {
  type: 'save-to-group'
  groupUuid: string
  existingItem: Item
}

export type CreateToGroupSaveOperation = SaveOperationCommon & {
  type: 'create-to-group'
  groupUuid: string
}

export type GroupSaveOperation =
  | AddToGroupSaveOperation
  | RemoveFromGroupSaveOperation
  | MoveToOtherGroupSaveOperation
  | SaveToGroupSaveOperation
  | CreateToGroupSaveOperation

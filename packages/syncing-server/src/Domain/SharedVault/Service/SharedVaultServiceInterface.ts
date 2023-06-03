import { SharedVaultUser } from './../../SharedVaultUser/Model/SharedVaultUser'
import { SharedVault } from '../Model/SharedVault'
import { Item } from '../../Item/Item'

export type CreateSharedVaultDTO = {
  userUuid: string
  specifiedItemsKeyUuid: string
  keySystemIdentifier: string
}

export type CreateSharedVaultResult = {
  sharedVault: SharedVault
  sharedVaultUser: SharedVaultUser
}

export type UpdateSharedVaultDTO = {
  originatorUuid: string
  sharedVaultUuid: string
  specifiedItemsKeyUuid: string
}

export interface SharedVaultServiceInterface {
  createSharedVault(dto: CreateSharedVaultDTO): Promise<CreateSharedVaultResult>
  updateSharedVault(dto: UpdateSharedVaultDTO): Promise<SharedVault | null>
  deleteSharedVault(dto: { sharedVaultUuid: string; originatorUuid: string }): Promise<boolean>

  getSharedVault(dto: { sharedVaultUuid: string }): Promise<SharedVault | null>
  getSharedVaults(dto: { userUuid: string; lastSyncTime?: number }): Promise<SharedVault[]>

  addItemToSharedVault(dto: { itemUuid: string; sharedVaultUuid: string; originatorUuid: string }): Promise<Item | null>
  removeItemFromSharedVault(dto: { itemUuid: string; sharedVaultUuid: string; originatorUuid: string }): Promise<Item | null>
}

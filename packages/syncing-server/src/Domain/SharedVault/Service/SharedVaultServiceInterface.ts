import { SharedVaultUser } from './../../SharedVaultUser/Model/SharedVaultUser'
import { SharedVault } from '../Model/SharedVault'

export type CreateSharedVaultDTO = {
  userUuid: string
}

export type CreateSharedVaultResult = {
  sharedVault: SharedVault
  sharedVaultUser: SharedVaultUser
}

export interface SharedVaultServiceInterface {
  createSharedVault(dto: CreateSharedVaultDTO): Promise<CreateSharedVaultResult>
  deleteSharedVault(dto: { sharedVaultUuid: string; originatorUuid: string }): Promise<boolean>

  getSharedVault(dto: { sharedVaultUuid: string }): Promise<SharedVault | null>
  getSharedVaults(dto: { userUuid: string; lastSyncTime?: number }): Promise<SharedVault[]>
}

import { SharedVaultUser } from '../Model/SharedVaultUser'
import { SharedVaultUserPermission } from '../Model/SharedVaultUserPermission'
import { GetSharedVaultUsersDTO } from './GetSharedVaultUsersDTO'

export interface SharedVaultUserServiceInterface {
  addSharedVaultUser(dto: { sharedVaultUuid: string; userUuid: string; permissions: SharedVaultUserPermission }): Promise<SharedVaultUser>

  getAllSharedVaultUsersForUser(dto: GetSharedVaultUsersDTO): Promise<SharedVaultUser[]>

  getUserForSharedVault(dto: { userUuid: string; sharedVaultUuid: string }): Promise<SharedVaultUser | null>

  getSharedVaultUsersForSharedVault(dto: {
    sharedVaultUuid: string
    originatorUuid: string
  }): Promise<{ users: SharedVaultUser[]; isAdmin: boolean } | undefined>

  deleteSharedVaultUser(dto: { originatorUuid: string; sharedVaultUuid: string; userUuid: string }): Promise<boolean>

  deleteAllSharedVaultUsersForSharedVault(dto: { originatorUuid: string; sharedVaultUuid: string }): Promise<boolean>
}

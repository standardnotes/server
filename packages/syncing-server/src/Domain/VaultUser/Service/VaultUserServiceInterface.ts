import { VaultUser } from '../Model/VaultUser'
import { VaultUserPermission } from '../Model/VaultUserPermission'
import { GetVaultUsersDTO } from './GetVaultUsersDTO'

export interface VaultUserServiceInterface {
  addVaultUser(dto: {
    vaultUuid: string
    userUuid: string
    permissions: VaultUserPermission
  }): Promise<VaultUser | null>

  getAllVaultUsersForUser(dto: GetVaultUsersDTO): Promise<VaultUser[]>

  getUserForVault(dto: { userUuid: string; vaultUuid: string }): Promise<VaultUser | null>

  getVaultUsersForVault(dto: {
    vaultUuid: string
    originatorUuid: string
  }): Promise<{ users: VaultUser[]; isAdmin: boolean } | undefined>

  deleteVaultUser(dto: { originatorUuid: string; vaultUuid: string; userUuid: string }): Promise<boolean>

  deleteAllVaultUsersForVault(dto: { originatorUuid: string; vaultUuid: string }): Promise<boolean>
}

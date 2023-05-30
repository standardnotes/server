import { RemovedVaultUser } from '../Model/RemovedVaultUser'
import { GetRemovedVaultUsersDTO } from './GetRemovedVaultUsersDTO'

export interface RemovedVaultUserServiceInterface {
  addRemovedVaultUser(dto: { vaultUuid: string; userUuid: string; removedBy: string }): Promise<RemovedVaultUser | null>

  getAllRemovedVaultUsersForUser(dto: GetRemovedVaultUsersDTO): Promise<RemovedVaultUser[]>

  deleteRemovedVaultUser(dto: { vaultUuid: string; userUuid: string }): Promise<boolean>
}

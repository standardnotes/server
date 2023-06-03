import { RemovedSharedVaultUser } from '../Model/RemovedSharedVaultUser'
import { GetRemovedSharedVaultUsersDTO } from './GetRemovedSharedVaultUsersDTO'

export interface RemovedSharedVaultUserServiceInterface {
  addRemovedSharedVaultUser(dto: { sharedVaultUuid: string; userUuid: string; removedBy: string }): Promise<RemovedSharedVaultUser | null>

  getAllRemovedSharedVaultUsersForUser(dto: GetRemovedSharedVaultUsersDTO): Promise<RemovedSharedVaultUser[]>

  deleteRemovedSharedVaultUser(dto: { sharedVaultUuid: string; userUuid: string }): Promise<boolean>
}

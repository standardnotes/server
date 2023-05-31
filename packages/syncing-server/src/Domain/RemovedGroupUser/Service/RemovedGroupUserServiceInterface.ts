import { RemovedGroupUser } from '../Model/RemovedGroupUser'
import { GetRemovedGroupUsersDTO } from './GetRemovedGroupUsersDTO'

export interface RemovedGroupUserServiceInterface {
  addRemovedGroupUser(dto: { groupUuid: string; userUuid: string; removedBy: string }): Promise<RemovedGroupUser | null>

  getAllRemovedGroupUsersForUser(dto: GetRemovedGroupUsersDTO): Promise<RemovedGroupUser[]>

  deleteRemovedGroupUser(dto: { groupUuid: string; userUuid: string }): Promise<boolean>
}

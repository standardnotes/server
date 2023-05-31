import { RemovedGroupUser } from '../Model/RemovedGroupUser'

export type RemovedGroupUserFindAllForUserQuery = {
  userUuid: string
}

export interface RemovedGroupUserRepositoryInterface {
  create(group: RemovedGroupUser): Promise<RemovedGroupUser>
  remove(group: RemovedGroupUser): Promise<RemovedGroupUser>
  findAllForUser(query: RemovedGroupUserFindAllForUserQuery): Promise<RemovedGroupUser[]>
  findByUserUuidAndGroupUuid(userUuid: string, groupUuid: string): Promise<RemovedGroupUser | null>
}

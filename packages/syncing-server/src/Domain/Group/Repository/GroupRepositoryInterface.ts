import { Group } from '../Model/Group'

export type GroupQuery = {
  userUuid: string
}

export type UserGroupsQuery = {
  userUuid: string
}

export interface GroupsRepositoryInterface {
  findByUuid(uuid: string): Promise<Group | null>
  create(group: Group): Promise<Group>
  save(group: Group): Promise<Group>
  remove(group: Group): Promise<Group>
  findAll(query: UserGroupsQuery): Promise<Group[]>
}

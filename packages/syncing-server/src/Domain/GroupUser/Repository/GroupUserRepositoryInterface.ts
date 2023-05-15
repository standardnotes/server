import { GroupUser } from '../Model/GroupUser'
import { GroupUserQuery } from './GroupUserQuery'

export interface GroupUserRepositoryInterface {
  findAll(query: GroupUserQuery): Promise<GroupUser[]>
}

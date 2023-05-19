import { GroupUser } from '../Model/GroupKey'
import { GroupUserHash } from './GroupUserHash'

export interface GroupUserFactoryInterface {
  create(dto: GroupUserHash): GroupUser
  createStub(dto: GroupUserHash): GroupUser
}

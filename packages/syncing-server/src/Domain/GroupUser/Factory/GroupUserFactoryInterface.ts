import { GroupUser } from '../Model/GroupUser'
import { GroupUserHash } from './GroupUserHash'

export interface GroupUserFactoryInterface {
  create(dto: GroupUserHash): GroupUser
  createStub(dto: GroupUserHash): GroupUser
}

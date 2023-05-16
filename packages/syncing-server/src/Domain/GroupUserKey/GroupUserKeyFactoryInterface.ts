import { GroupUserKey } from './Model/GroupUserKey'
import { GroupUserKeyHash } from './GroupUserKeyHash'

export interface GroupUserKeyFactoryInterface {
  create(dto: GroupUserKeyHash): GroupUserKey
  createStub(dto: GroupUserKeyHash): GroupUserKey
}

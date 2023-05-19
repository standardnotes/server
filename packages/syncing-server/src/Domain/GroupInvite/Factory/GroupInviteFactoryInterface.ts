import { GroupInvite } from '../Model/GroupInvite'
import { GroupInviteHash } from './GroupInviteHash'

export interface GroupInviteFactoryInterface {
  create(dto: GroupInviteHash): GroupInvite
  createStub(dto: GroupInviteHash): GroupInvite
}

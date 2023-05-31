import { Group } from '../Model/Group'
import { GroupHash } from './GroupHash'

export interface GroupFactoryInterface {
  create(dto: { userUuid: string; groupHash: GroupHash }): Group
  createStub(dto: { userUuid: string; groupHash: GroupHash }): Group
}

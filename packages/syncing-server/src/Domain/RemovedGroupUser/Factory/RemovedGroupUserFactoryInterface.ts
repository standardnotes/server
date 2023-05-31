import { RemovedGroupUser } from '../Model/RemovedGroupUser'
import { RemovedGroupUserHash } from './RemovedGroupUserHash'

export interface RemovedGroupUserFactoryInterface {
  create(dto: RemovedGroupUserHash): RemovedGroupUser
  createStub(dto: RemovedGroupUserHash): RemovedGroupUser
}

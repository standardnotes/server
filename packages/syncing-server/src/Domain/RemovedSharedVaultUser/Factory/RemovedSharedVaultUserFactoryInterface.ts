import { RemovedSharedVaultUser } from '../Model/RemovedSharedVaultUser'
import { RemovedSharedVaultUserHash } from './RemovedSharedVaultUserHash'

export interface RemovedSharedVaultUserFactoryInterface {
  create(dto: RemovedSharedVaultUserHash): RemovedSharedVaultUser
  createStub(dto: RemovedSharedVaultUserHash): RemovedSharedVaultUser
}

import { RemovedVaultUser } from '../Model/RemovedVaultUser'
import { RemovedVaultUserHash } from './RemovedVaultUserHash'

export interface RemovedVaultUserFactoryInterface {
  create(dto: RemovedVaultUserHash): RemovedVaultUser
  createStub(dto: RemovedVaultUserHash): RemovedVaultUser
}

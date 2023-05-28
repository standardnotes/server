import { VaultUser } from '../Model/VaultUser'
import { VaultUserHash } from './VaultUserHash'

export interface VaultUserFactoryInterface {
  create(dto: VaultUserHash): VaultUser
  createStub(dto: VaultUserHash): VaultUser
}

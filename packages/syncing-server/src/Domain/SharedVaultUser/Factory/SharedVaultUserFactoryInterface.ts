import { SharedVaultUser } from '../Model/SharedVaultUser'
import { SharedVaultUserHash } from './SharedVaultUserHash'

export interface SharedVaultUserFactoryInterface {
  create(dto: SharedVaultUserHash): SharedVaultUser
  createStub(dto: SharedVaultUserHash): SharedVaultUser
}

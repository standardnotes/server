import { SharedVault } from '../Model/SharedVault'
import { SharedVaultHash } from './SharedVaultHash'

export interface SharedVaultFactoryInterface {
  create(dto: { userUuid: string; sharedVaultHash: SharedVaultHash }): SharedVault
  createStub(dto: { userUuid: string; sharedVaultHash: SharedVaultHash }): SharedVault
}

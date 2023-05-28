import { Vault } from '../Model/Vault'
import { VaultHash } from './VaultHash'

export interface VaultFactoryInterface {
  create(dto: { userUuid: string; vaultHash: VaultHash }): Vault
  createStub(dto: { userUuid: string; vaultHash: VaultHash }): Vault
}

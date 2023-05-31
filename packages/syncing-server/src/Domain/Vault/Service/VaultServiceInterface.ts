import { VaultUser } from './../../VaultUser/Model/VaultUser'
import { Vault } from '../Model/Vault'

export type CreateVaultDTO = {
  userUuid: string
  vaultUuid: string
  specifiedItemsKeyUuid: string
}

export type CreateVaultResult = {
  vault: Vault
  vaultUser: VaultUser
}

export type UpdateVaultDTO = {
  originatorUuid: string
  vaultUuid: string
  specifiedItemsKeyUuid: string
}

export interface VaultServiceInterface {
  createVault(dto: CreateVaultDTO): Promise<CreateVaultResult | null>

  updateVault(dto: UpdateVaultDTO): Promise<Vault | null>

  deleteVault(dto: { vaultUuid: string; originatorUuid: string }): Promise<boolean>

  getVault(dto: { vaultUuid: string }): Promise<Vault | null>

  getVaults(dto: { userUuid: string; lastSyncTime?: number }): Promise<Vault[]>
}

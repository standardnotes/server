import { Vault } from '../Model/Vault'

export type CreateVaultDTO = {
  userUuid: string
  vaultUuid: string
  vaultKeyTimestamp: number
  specifiedItemsKeyUuid: string
}

export type UpdateVaultDTO = {
  originatorUuid: string
  vaultUuid: string
  vaultKeyTimestamp: number
  specifiedItemsKeyUuid: string
}

export interface VaultServiceInterface {
  createVault(dto: CreateVaultDTO): Promise<Vault | null>

  updateVault(dto: UpdateVaultDTO): Promise<Vault | null>

  deleteVault(dto: { vaultUuid: string; originatorUuid: string }): Promise<boolean>

  getVault(dto: { vaultUuid: string }): Promise<Vault | null>

  getVaults(dto: { userUuid: string; lastSyncTime?: number }): Promise<Vault[]>
}

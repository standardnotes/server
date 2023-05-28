import { Vault } from '../Model/Vault'

export type VaultQuery = {
  userUuid: string
}

export type UserVaultsQuery = {
  userUuid?: string
  vaultUuids?: string[]
  lastSyncTime?: number
}

export interface VaultsRepositoryInterface {
  findByUuid(uuid: string): Promise<Vault | null>
  create(vault: Vault): Promise<Vault>
  save(vault: Vault): Promise<Vault>
  remove(vault: Vault): Promise<Vault>
  findAll(query: UserVaultsQuery): Promise<Vault[]>
}

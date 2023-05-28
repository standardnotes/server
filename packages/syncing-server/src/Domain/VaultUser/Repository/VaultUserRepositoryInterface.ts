import { VaultUser } from '../Model/VaultUser'

export type VaultUserQuery = {
  userUuid: string
}

export type VaultUserFindAllForUserQuery = {
  userUuid: string
  lastSyncTime?: number
}

export type VaultUserFindAllForVault = {
  vaultUuid: string
}

export interface VaultUserRepositoryInterface {
  findByUuid(vaultUserUuid: string): Promise<VaultUser | null>
  create(vault: VaultUser): Promise<VaultUser>
  save(vaultUser: VaultUser): Promise<VaultUser>
  remove(vault: VaultUser): Promise<VaultUser>
  findAllForUser(query: VaultUserFindAllForUserQuery): Promise<VaultUser[]>
  findAllForVault(query: VaultUserFindAllForVault): Promise<VaultUser[]>
  findByUserUuidAndVaultUuid(userUuid: string, vaultUuid: string): Promise<VaultUser | null>
}

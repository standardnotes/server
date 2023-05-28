import { VaultInvite } from '../Model/VaultInvite'

export type VaultInviteQuery = {
  userUuid: string
}

export type VaultInviteFindAllForUserQuery = {
  userUuid?: string
  lastSyncTime?: number
  inviterUuid?: string
}

export type VaultInviteFindAllForVault = {
  vaultUuid: string
}

export interface VaultInviteRepositoryInterface {
  findByUuid(vaultInviteUuid: string): Promise<VaultInvite | null>
  create(vault: VaultInvite): Promise<VaultInvite>
  save(vaultInvite: VaultInvite): Promise<VaultInvite>
  remove(vault: VaultInvite): Promise<VaultInvite>
  findAll(query: VaultInviteFindAllForUserQuery): Promise<VaultInvite[]>
  findAllForVault(query: VaultInviteFindAllForVault): Promise<VaultInvite[]>
  findByUserUuidAndVaultUuid(userUuid: string, vaultUuid: string): Promise<VaultInvite | null>
}

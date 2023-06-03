import { SharedVaultInvite } from '../Model/SharedVaultInvite'

export type SharedVaultInviteQuery = {
  userUuid: string
}

export type SharedVaultInviteFindAllForUserQuery = {
  userUuid?: string
  lastSyncTime?: number
  inviterUuid?: string
}

export type SharedVaultInviteFindAllForSharedVault = {
  sharedVaultUuid: string
}

export interface SharedVaultInviteRepositoryInterface {
  findByUuid(sharedVaultInviteUuid: string): Promise<SharedVaultInvite | null>
  create(sharedVault: SharedVaultInvite): Promise<SharedVaultInvite>
  save(sharedVaultInvite: SharedVaultInvite): Promise<SharedVaultInvite>
  remove(sharedVault: SharedVaultInvite): Promise<SharedVaultInvite>
  findAll(query: SharedVaultInviteFindAllForUserQuery): Promise<SharedVaultInvite[]>
  findAllForSharedVault(query: SharedVaultInviteFindAllForSharedVault): Promise<SharedVaultInvite[]>
  findByUserUuidAndSharedVaultUuid(userUuid: string, sharedVaultUuid: string): Promise<SharedVaultInvite | null>
}

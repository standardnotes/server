import { SharedVaultUser } from '../Model/SharedVaultUser'

export type SharedVaultUserFindAllForUserQuery = {
  userUuid: string
  lastSyncTime?: number
}

export type SharedVaultUserFindAllForSharedVault = {
  sharedVaultUuid: string
}

export interface SharedVaultUserRepositoryInterface {
  findByUuid(sharedVaultUserUuid: string): Promise<SharedVaultUser | null>
  create(sharedVault: SharedVaultUser): Promise<SharedVaultUser>
  save(sharedVaultUser: SharedVaultUser): Promise<SharedVaultUser>
  remove(sharedVault: SharedVaultUser): Promise<SharedVaultUser>
  findAllForUser(query: SharedVaultUserFindAllForUserQuery): Promise<SharedVaultUser[]>
  findAllForSharedVault(query: SharedVaultUserFindAllForSharedVault): Promise<SharedVaultUser[]>
  findByUserUuidAndSharedVaultUuid(userUuid: string, sharedVaultUuid: string): Promise<SharedVaultUser | null>
}

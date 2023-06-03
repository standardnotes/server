import { SharedVault } from '../Model/SharedVault'

export type SharedVaultQuery = {
  userUuid: string
}

export type UserSharedVaultsQuery = {
  userUuid?: string
  sharedVaultUuids?: string[]
  lastSyncTime?: number
}

export interface SharedVaultsRepositoryInterface {
  findByUuid(uuid: string): Promise<SharedVault | null>
  create(sharedVault: SharedVault): Promise<SharedVault>
  save(sharedVault: SharedVault): Promise<SharedVault>
  remove(sharedVault: SharedVault): Promise<SharedVault>
  findAll(query: UserSharedVaultsQuery): Promise<SharedVault[]>
}

import { SharedVaultUser, Uuid } from '@standardnotes/domain-core'

export interface SharedVaultUserRepositoryInterface {
  findByUserUuidAndSharedVaultUuid(dto: { userUuid: Uuid; sharedVaultUuid: Uuid }): Promise<SharedVaultUser | null>
  findByUserUuid(userUuid: Uuid): Promise<SharedVaultUser[]>
  findDesignatedSurvivorBySharedVaultUuid(sharedVaultUuid: Uuid): Promise<SharedVaultUser | null>
  save(sharedVaultUser: SharedVaultUser): Promise<void>
  remove(sharedVault: SharedVaultUser): Promise<void>
}

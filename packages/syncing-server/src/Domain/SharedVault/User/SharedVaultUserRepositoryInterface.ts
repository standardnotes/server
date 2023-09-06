import { SharedVaultUser, Uuid } from '@standardnotes/domain-core'

export interface SharedVaultUserRepositoryInterface {
  findByUuid(sharedVaultUserUuid: Uuid): Promise<SharedVaultUser | null>
  findByUserUuid(userUuid: Uuid): Promise<SharedVaultUser[]>
  findBySharedVaultUuid(sharedVaultUuid: Uuid): Promise<SharedVaultUser[]>
  save(sharedVaultUser: SharedVaultUser): Promise<void>
  remove(sharedVault: SharedVaultUser): Promise<void>
  removeBySharedVaultUuid(sharedVaultUuid: Uuid): Promise<void>
  findByUserUuidAndSharedVaultUuid(dto: { userUuid: Uuid; sharedVaultUuid: Uuid }): Promise<SharedVaultUser | null>
}

import { Uuid } from '@standardnotes/domain-core'

import { SharedVaultUser } from './SharedVaultUser'

export interface SharedVaultUserRepositoryInterface {
  findByUuid(sharedVaultUserUuid: Uuid): Promise<SharedVaultUser | null>
  findByUserUuid(userUuid: Uuid): Promise<SharedVaultUser[]>
  save(sharedVaultUser: SharedVaultUser): Promise<void>
  remove(sharedVault: SharedVaultUser): Promise<void>
  findByUserUuidAndSharedVaultUuid(dto: { userUuid: Uuid; sharedVaultUuid: Uuid }): Promise<SharedVaultUser | null>
}

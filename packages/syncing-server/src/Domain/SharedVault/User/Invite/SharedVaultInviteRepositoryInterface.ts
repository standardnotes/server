import { Uuid } from '@standardnotes/domain-core'

import { SharedVaultInvite } from './SharedVaultInvite'

export interface SharedVaultInviteRepositoryInterface {
  findByUuid(sharedVaultInviteUuid: Uuid): Promise<SharedVaultInvite | null>
  save(sharedVaultInvite: SharedVaultInvite): Promise<void>
  remove(sharedVaultInvite: SharedVaultInvite): Promise<void>
  removeBySharedVaultUuid(sharedVaultUuid: Uuid): Promise<void>
  findByUserUuidAndSharedVaultUuid(dto: { userUuid: Uuid; sharedVaultUuid: Uuid }): Promise<SharedVaultInvite | null>
}

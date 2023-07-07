import { Uuid } from '@standardnotes/domain-core'

import { SharedVaultInvite } from './SharedVaultInvite'

export interface SharedVaultInviteRepositoryInterface {
  findByUuid(sharedVaultInviteUuid: Uuid): Promise<SharedVaultInvite | null>
  save(sharedVaultInvite: SharedVaultInvite): Promise<void>
  remove(sharedVaultInvite: SharedVaultInvite): Promise<void>
  removeBySharedVaultUuid(sharedVaultUuid: Uuid): Promise<void>
  findByUserUuid(userUuid: Uuid): Promise<SharedVaultInvite[]>
  findBySenderUuid(senderUuid: Uuid): Promise<SharedVaultInvite[]>
  findByUserUuidAndSharedVaultUuid(dto: { userUuid: Uuid; sharedVaultUuid: Uuid }): Promise<SharedVaultInvite | null>
  findBySenderUuidAndSharedVaultUuid(dto: { senderUuid: Uuid; sharedVaultUuid: Uuid }): Promise<SharedVaultInvite[]>
}

import { Uuid } from '@standardnotes/domain-core'

import { SharedVaultInvite } from './SharedVaultInvite'

export interface SharedVaultInviteRepositoryInterface {
  findByUuid(sharedVaultInviteUuid: Uuid): Promise<SharedVaultInvite | null>
  save(sharedVaultInvite: SharedVaultInvite): Promise<void>
  remove(sharedVaultInvite: SharedVaultInvite): Promise<void>
  findBySharedVaultUuid(sharedVaultUuid: Uuid): Promise<SharedVaultInvite[]>
  findByUserUuid(userUuid: Uuid): Promise<SharedVaultInvite[]>
  findByUserUuidUpdatedAfter(userUuid: Uuid, updatedAtTimestamp: number): Promise<SharedVaultInvite[]>
  findBySenderUuid(senderUuid: Uuid): Promise<SharedVaultInvite[]>
  findByUserUuidAndSharedVaultUuid(dto: { userUuid: Uuid; sharedVaultUuid: Uuid }): Promise<SharedVaultInvite | null>
  findBySenderUuidAndSharedVaultUuid(dto: { senderUuid: Uuid; sharedVaultUuid: Uuid }): Promise<SharedVaultInvite[]>
}

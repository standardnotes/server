import { SharedVaultInvite } from '../Model/SharedVaultInvite'
import { CreateInviteDTO } from './CreateInviteDTO'
import { GetUserSharedVaultInvitesDTO } from './GetUserSharedVaultInvitesDTO'
import { UpdateInviteDTO } from './UpdateInviteDTO'

export interface SharedVaultInviteServiceInterface {
  createInvite(dto: CreateInviteDTO): Promise<SharedVaultInvite | null>
  updateInvite(dto: UpdateInviteDTO): Promise<SharedVaultInvite | null>
  acceptInvite(dto: { originatorUuid: string; inviteUuid: string }): Promise<boolean>

  getInvitesForUser(dto: GetUserSharedVaultInvitesDTO): Promise<SharedVaultInvite[]>
  getInvitesForSharedVault(dto: {
    sharedVaultUuid: string
    originatorUuid: string
  }): Promise<SharedVaultInvite[] | undefined>
  getOutboundInvitesForUser(dto: { userUuid: string }): Promise<SharedVaultInvite[]>

  declineInvite(dto: { originatorUuid: string; inviteUuid: string }): Promise<boolean>
  deleteInvite(dto: { originatorUuid: string; inviteUuid: string }): Promise<boolean>
  deleteAllInvitesForSharedVault(dto: { originatorUuid: string; sharedVaultUuid: string }): Promise<boolean>
  deleteAllInboundInvites(dto: { userUuid: string }): Promise<void>
  deleteAllOutboundInvites(dto: { userUuid: string }): Promise<void>
}

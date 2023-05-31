import { GroupInvite } from '../Model/GroupInvite'
import { CreateInviteDTO } from './CreateInviteDTO'
import { GetUserGroupInvitesDTO } from './GetUserGroupInvitesDTO'
import { UpdateInviteDTO } from './UpdateInviteDTO'

export interface GroupInviteServiceInterface {
  createInvite(dto: CreateInviteDTO): Promise<GroupInvite | null>
  updateInvite(dto: UpdateInviteDTO): Promise<GroupInvite | null>
  acceptInvite(dto: { originatorUuid: string; inviteUuid: string }): Promise<boolean>

  getInvitesForUser(dto: GetUserGroupInvitesDTO): Promise<GroupInvite[]>
  getInvitesForGroup(dto: { groupUuid: string; originatorUuid: string }): Promise<GroupInvite[] | undefined>
  getOutboundInvitesForUser(dto: { userUuid: string }): Promise<GroupInvite[]>

  declineInvite(dto: { originatorUuid: string; inviteUuid: string }): Promise<boolean>
  deleteInvite(dto: { originatorUuid: string; groupUuid: string; inviteUuid: string }): Promise<boolean>
  deleteAllInvitesForGroup(dto: { originatorUuid: string; groupUuid: string }): Promise<boolean>
  deleteAllInboundInvites(dto: { userUuid: string }): Promise<void>
}

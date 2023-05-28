import { VaultInvite } from '../Model/VaultInvite'
import { CreateInviteDTO } from './CreateInviteDTO'
import { GetUserVaultInvitesDTO } from './GetUserVaultInvitesDTO'
import { UpdateInviteDTO } from './UpdateInviteDTO'

export interface VaultInviteServiceInterface {
  createInvite(dto: CreateInviteDTO): Promise<VaultInvite | null>

  updateInvite(dto: UpdateInviteDTO): Promise<VaultInvite | null>

  getInvitesForUser(dto: GetUserVaultInvitesDTO): Promise<VaultInvite[]>

  getInvitesForVault(dto: { vaultUuid: string; originatorUuid: string }): Promise<VaultInvite[] | undefined>

  getOutboundInvitesForUser(dto: { userUuid: string }): Promise<VaultInvite[]>

  acceptInvite(dto: { originatorUuid: string; inviteUuid: string }): Promise<boolean>

  declineInvite(dto: { originatorUuid: string; inviteUuid: string }): Promise<boolean>

  deleteInvite(dto: { originatorUuid: string; vaultUuid: string; inviteUuid: string }): Promise<boolean>

  deleteAllInvitesForVault(dto: { originatorUuid: string; vaultUuid: string }): Promise<boolean>

  deleteAllInboundInvites(dto: { userUuid: string }): Promise<void>
}

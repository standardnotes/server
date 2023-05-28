import { TimerInterface } from '@standardnotes/time'
import { VaultInvite } from '../Model/VaultInvite'
import { VaultInviteFactoryInterface } from '../Factory/VaultInviteFactoryInterface'
import { v4 as uuidv4 } from 'uuid'
import { VaultInviteRepositoryInterface } from '../Repository/VaultInviteRepositoryInterface'
import { VaultInviteServiceInterface } from './VaultInviteServiceInterface'
import { GetUserVaultInvitesDTO } from './GetUserVaultInvitesDTO'
import { VaultsRepositoryInterface } from '../../Vault/Repository/VaultRepositoryInterface'
import { VaultUserServiceInterface } from '../../VaultUser/Service/VaultUserServiceInterface'
import { VaultInviteType } from '../Model/VaultInviteType'
import { CreateInviteDTO } from './CreateInviteDTO'
import { UpdateInviteDTO } from './UpdateInviteDTO'

export class VaultInviteService implements VaultInviteServiceInterface {
  constructor(
    private vaultRepository: VaultsRepositoryInterface,
    private vaultInviteRepository: VaultInviteRepositoryInterface,
    private vaultInviteFactory: VaultInviteFactoryInterface,
    private vaultUserService: VaultUserServiceInterface,
    private timer: TimerInterface,
  ) {}

  async createInvite(dto: CreateInviteDTO): Promise<VaultInvite | null> {
    const vault = await this.vaultRepository.findByUuid(dto.vaultUuid)
    if (!vault || vault.userUuid !== dto.originatorUuid) {
      return null
    }

    const timestamp = this.timer.getTimestampInMicroseconds()

    const vaultInvite = this.vaultInviteFactory.create({
      uuid: uuidv4(),
      user_uuid: dto.userUuid,
      vault_uuid: dto.vaultUuid,
      inviter_uuid: dto.originatorUuid,
      inviter_public_key: dto.inviterPublicKey,
      encrypted_vault_data: dto.encryptedVaultData,
      invite_type: dto.inviteType,
      permissions: dto.permissions,
      created_at_timestamp: timestamp,
      updated_at_timestamp: timestamp,
    })

    return this.vaultInviteRepository.create(vaultInvite)
  }

  async updateInvite(dto: UpdateInviteDTO): Promise<VaultInvite | null> {
    const vaultInvite = await this.vaultInviteRepository.findByUuid(dto.inviteUuid)
    if (!vaultInvite || vaultInvite.inviterUuid !== dto.originatorUuid) {
      return null
    }

    vaultInvite.inviterPublicKey = dto.inviterPublicKey
    vaultInvite.encryptedVaultData = dto.encryptedVaultData
    if (dto.permissions) {
      vaultInvite.permissions = dto.permissions
    }
    vaultInvite.updatedAtTimestamp = this.timer.getTimestampInMicroseconds()

    return this.vaultInviteRepository.save(vaultInvite)
  }

  getInvitesForUser(dto: GetUserVaultInvitesDTO): Promise<VaultInvite[]> {
    return this.vaultInviteRepository.findAll(dto)
  }

  getOutboundInvitesForUser(dto: { userUuid: string }): Promise<VaultInvite[]> {
    return this.vaultInviteRepository.findAll({
      inviterUuid: dto.userUuid,
    })
  }

  async deleteAllInboundInvites(dto: { userUuid: string }): Promise<void> {
    const inboundInvites = await this.vaultInviteRepository.findAll({
      userUuid: dto.userUuid,
    })

    for (const invite of inboundInvites) {
      await this.vaultInviteRepository.remove(invite)
    }
  }

  async getInvitesForVault(dto: { vaultUuid: string; originatorUuid: string }): Promise<VaultInvite[] | undefined> {
    const vault = await this.vaultRepository.findByUuid(dto.vaultUuid)
    if (!vault) {
      return undefined
    }

    const isUserVaultAdmin = vault && vault.userUuid === dto.originatorUuid
    if (!isUserVaultAdmin) {
      return undefined
    }

    const users = await this.vaultInviteRepository.findAllForVault({ vaultUuid: dto.vaultUuid })

    return users
  }

  async acceptInvite(dto: { originatorUuid: string; inviteUuid: string }): Promise<boolean> {
    const invite = await this.vaultInviteRepository.findByUuid(dto.inviteUuid)
    if (!invite) {
      return false
    }

    const isAuthorized = invite.userUuid === dto.originatorUuid
    if (!isAuthorized) {
      return false
    }

    if (invite.inviteType === VaultInviteType.Join) {
      const addedUser = await this.vaultUserService.addVaultUser({
        userUuid: dto.originatorUuid,
        vaultUuid: invite.vaultUuid,
        permissions: invite.permissions,
      })

      if (!addedUser) {
        return false
      }
    }

    await this.vaultInviteRepository.remove(invite)

    return true
  }

  async declineInvite(dto: { originatorUuid: string; inviteUuid: string }): Promise<boolean> {
    const invite = await this.vaultInviteRepository.findByUuid(dto.inviteUuid)
    if (!invite) {
      return false
    }

    const isAuthorized = invite.userUuid === dto.originatorUuid
    if (!isAuthorized) {
      return false
    }

    await this.vaultInviteRepository.remove(invite)

    return true
  }

  async deleteInvite(dto: { originatorUuid: string; inviteUuid: string }): Promise<boolean> {
    const invite = await this.vaultInviteRepository.findByUuid(dto.inviteUuid)
    if (!invite) {
      return false
    }

    const isAuthorized = invite.inviterUuid === dto.originatorUuid || invite.userUuid === dto.originatorUuid
    if (!isAuthorized) {
      return false
    }

    await this.vaultInviteRepository.remove(invite)

    return true
  }

  async deleteAllInvitesForVault(dto: { originatorUuid: string; vaultUuid: string }): Promise<boolean> {
    const vault = await this.vaultRepository.findByUuid(dto.vaultUuid)
    if (!vault || vault.userUuid !== dto.originatorUuid) {
      return false
    }

    const vaultInvites = await this.vaultInviteRepository.findAllForVault({ vaultUuid: dto.vaultUuid })
    for (const vaultInvite of vaultInvites) {
      await this.vaultInviteRepository.remove(vaultInvite)
    }

    return true
  }
}

import { TimerInterface } from '@standardnotes/time'
import { Vault } from '../Model/Vault'
import { VaultsRepositoryInterface } from '../Repository/VaultRepositoryInterface'
import { CreateVaultDTO, VaultServiceInterface, UpdateVaultDTO, CreateVaultResult } from './VaultServiceInterface'
import { VaultFactoryInterface } from '../Factory/VaultFactoryInterface'
import { VaultUserServiceInterface } from '../../VaultUser/Service/VaultUserServiceInterface'
import { VaultInviteServiceInterface } from '../../VaultInvite/Service/VaultInviteServiceInterface'

export class VaultService implements VaultServiceInterface {
  constructor(
    private vaultRepository: VaultsRepositoryInterface,
    private vaultFactory: VaultFactoryInterface,
    private vaultUserService: VaultUserServiceInterface,
    private vaultInviteService: VaultInviteServiceInterface,
    private timer: TimerInterface,
  ) {}

  async createVault(dto: CreateVaultDTO): Promise<CreateVaultResult | null> {
    const existingVault = await this.vaultRepository.findByUuid(dto.vaultUuid)
    if (existingVault) {
      return null
    }

    const timestamp = this.timer.getTimestampInMicroseconds()
    const vault = this.vaultFactory.create({
      userUuid: dto.userUuid,
      vaultHash: {
        uuid: dto.vaultUuid,
        user_uuid: dto.userUuid,
        specified_items_key_uuid: dto.specifiedItemsKeyUuid,
        file_upload_bytes_limit: 1_000_000,
        file_upload_bytes_used: 0,
        created_at_timestamp: timestamp,
        updated_at_timestamp: timestamp,
      },
    })

    const savedVault = await this.vaultRepository.create(vault)

    const vaultUser = await this.vaultUserService.addVaultUser({
      vaultUuid: savedVault.uuid,
      userUuid: dto.userUuid,
      permissions: 'admin',
    })

    return { vault, vaultUser }
  }

  async getVault(dto: { vaultUuid: string }): Promise<Vault | null> {
    const vault = await this.vaultRepository.findByUuid(dto.vaultUuid)

    return vault
  }

  async getVaults(dto: { userUuid: string; lastSyncTime?: number }): Promise<Vault[]> {
    const vaultUsers = await this.vaultUserService.getAllVaultUsersForUser({
      userUuid: dto.userUuid,
    })

    const vaultUuids = vaultUsers.map((vaultUser) => vaultUser.vaultUuid)

    if (vaultUuids.length === 0) {
      return []
    }

    return this.vaultRepository.findAll({ vaultUuids, lastSyncTime: dto.lastSyncTime })
  }

  async updateVault(dto: UpdateVaultDTO): Promise<Vault | null> {
    const vault = await this.vaultRepository.findByUuid(dto.vaultUuid)
    if (!vault || vault.userUuid !== dto.originatorUuid) {
      return null
    }

    vault.specifiedItemsKeyUuid = dto.specifiedItemsKeyUuid
    vault.updatedAtTimestamp = this.timer.getTimestampInMicroseconds()

    const savedVault = await this.vaultRepository.save(vault)

    return savedVault
  }

  async deleteVault(dto: { vaultUuid: string; originatorUuid: string }): Promise<boolean> {
    const vault = await this.vaultRepository.findByUuid(dto.vaultUuid)
    if (!vault || vault.userUuid !== dto.originatorUuid) {
      return false
    }

    await this.vaultRepository.remove(vault)
    await this.vaultUserService.deleteAllVaultUsersForVault({
      vaultUuid: dto.vaultUuid,
      originatorUuid: dto.originatorUuid,
    })
    await this.vaultInviteService.deleteAllInvitesForVault({
      vaultUuid: dto.vaultUuid,
      originatorUuid: dto.originatorUuid,
    })

    return true
  }
}

import { RemovedVaultUserServiceInterface } from './../../RemovedVaultUser/Service/RemovedVaultUserServiceInterface'
import { TimerInterface } from '@standardnotes/time'
import { VaultUser } from '../Model/VaultUser'
import { VaultUserFactoryInterface } from '../Factory/VaultUserFactoryInterface'
import { v4 as uuidv4 } from 'uuid'
import { VaultUserRepositoryInterface } from '../Repository/VaultUserRepositoryInterface'
import { VaultUserServiceInterface } from './VaultUserServiceInterface'
import { GetVaultUsersDTO } from './GetVaultUsersDTO'
import { VaultsRepositoryInterface } from '../../Vault/Repository/VaultRepositoryInterface'
import { VaultUserPermission } from '../Model/VaultUserPermission'

export class VaultUserService implements VaultUserServiceInterface {
  constructor(
    private vaultRepository: VaultsRepositoryInterface,
    private vaultUserRepository: VaultUserRepositoryInterface,
    private vaultUserFactory: VaultUserFactoryInterface,
    private removedVaultUserService: RemovedVaultUserServiceInterface,
    private timer: TimerInterface,
  ) {}

  async addVaultUser(dto: {
    vaultUuid: string
    userUuid: string
    permissions: VaultUserPermission
  }): Promise<VaultUser | null> {
    const vault = await this.vaultRepository.findByUuid(dto.vaultUuid)
    if (!vault) {
      return null
    }

    await this.removedVaultUserService.deleteRemovedVaultUser({
      vaultUuid: dto.vaultUuid,
      userUuid: dto.userUuid,
    })

    const timestamp = this.timer.getTimestampInMicroseconds()
    const vaultUser = this.vaultUserFactory.create({
      uuid: uuidv4(),
      user_uuid: dto.userUuid,
      vault_uuid: dto.vaultUuid,
      permissions: dto.permissions,
      created_at_timestamp: timestamp,
      updated_at_timestamp: timestamp,
    })

    return this.vaultUserRepository.create(vaultUser)
  }

  getAllVaultUsersForUser(dto: GetVaultUsersDTO): Promise<VaultUser[]> {
    return this.vaultUserRepository.findAllForUser(dto)
  }

  getUserForVault(dto: { userUuid: string; vaultUuid: string }): Promise<VaultUser | null> {
    return this.vaultUserRepository.findByUserUuidAndVaultUuid(dto.userUuid, dto.vaultUuid)
  }

  async getVaultUsersForVault(dto: {
    vaultUuid: string
    originatorUuid: string
  }): Promise<{ users: VaultUser[]; isAdmin: boolean } | undefined> {
    const vault = await this.vaultRepository.findByUuid(dto.vaultUuid)
    if (!vault) {
      return undefined
    }

    const isUserVaultAdmin = vault && vault.userUuid === dto.originatorUuid
    const doesUserBelongToVault = await this.vaultUserRepository.findByUserUuidAndVaultUuid(
      dto.originatorUuid,
      dto.vaultUuid,
    )

    if (!isUserVaultAdmin && !doesUserBelongToVault) {
      return undefined
    }

    const users = await this.vaultUserRepository.findAllForVault({ vaultUuid: dto.vaultUuid })

    return {
      users,
      isAdmin: isUserVaultAdmin,
    }
  }

  async deleteVaultUser(dto: { originatorUuid: string; vaultUuid: string; userUuid: string }): Promise<boolean> {
    const vault = await this.vaultRepository.findByUuid(dto.vaultUuid)
    if (!vault) {
      return false
    }

    const isAuthorized = vault.userUuid === dto.originatorUuid || dto.userUuid === dto.originatorUuid
    if (!isAuthorized) {
      return false
    }

    const vaultUser = await this.vaultUserRepository.findByUserUuidAndVaultUuid(dto.userUuid, dto.vaultUuid)
    if (!vaultUser) {
      return false
    }

    await this.vaultUserRepository.remove(vaultUser)
    await this.removedVaultUserService.addRemovedVaultUser({
      vaultUuid: dto.vaultUuid,
      userUuid: dto.userUuid,
      removedBy: dto.originatorUuid,
    })

    return true
  }

  async deleteAllVaultUsersForVault(dto: { originatorUuid: string; vaultUuid: string }): Promise<boolean> {
    const vault = await this.vaultRepository.findByUuid(dto.vaultUuid)
    if (!vault || vault.userUuid !== dto.originatorUuid) {
      return false
    }

    const vaultUsers = await this.vaultUserRepository.findAllForVault({ vaultUuid: dto.vaultUuid })
    for (const vaultUser of vaultUsers) {
      await this.vaultUserRepository.remove(vaultUser)
      await this.removedVaultUserService.addRemovedVaultUser({
        vaultUuid: dto.vaultUuid,
        userUuid: vaultUser.userUuid,
        removedBy: dto.originatorUuid,
      })
    }

    return true
  }
}

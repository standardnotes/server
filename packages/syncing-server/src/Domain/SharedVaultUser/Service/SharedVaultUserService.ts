import { RemovedSharedVaultUserServiceInterface } from './../../RemovedSharedVaultUser/Service/RemovedSharedVaultUserServiceInterface'
import { TimerInterface } from '@standardnotes/time'
import { SharedVaultUser } from '../Model/SharedVaultUser'
import { SharedVaultUserFactoryInterface } from '../Factory/SharedVaultUserFactoryInterface'
import { v4 as uuidv4 } from 'uuid'
import { SharedVaultUserRepositoryInterface } from '../Repository/SharedVaultUserRepositoryInterface'
import { SharedVaultUserServiceInterface } from './SharedVaultUserServiceInterface'
import { GetSharedVaultUsersDTO } from './GetSharedVaultUsersDTO'
import { SharedVaultsRepositoryInterface } from '../../SharedVault/Repository/SharedVaultRepositoryInterface'
import { SharedVaultUserPermission } from '../Model/SharedVaultUserPermission'

export class SharedVaultUserService implements SharedVaultUserServiceInterface {
  constructor(
    private sharedVaultRepository: SharedVaultsRepositoryInterface,
    private sharedVaultUserRepository: SharedVaultUserRepositoryInterface,
    private sharedVaultUserFactory: SharedVaultUserFactoryInterface,
    private removedSharedVaultUserService: RemovedSharedVaultUserServiceInterface,
    private timer: TimerInterface,
  ) {}

  async addSharedVaultUser(dto: {
    sharedVaultUuid: string
    userUuid: string
    permissions: SharedVaultUserPermission
  }): Promise<SharedVaultUser> {
    const sharedVault = await this.sharedVaultRepository.findByUuid(dto.sharedVaultUuid)
    if (!sharedVault) {
      throw new Error('Attempting to add a shared vault user to a non-existent shared vault')
    }

    await this.removedSharedVaultUserService.deleteRemovedSharedVaultUser({
      sharedVaultUuid: dto.sharedVaultUuid,
      userUuid: dto.userUuid,
    })

    const timestamp = this.timer.getTimestampInMicroseconds()
    const sharedVaultUser = this.sharedVaultUserFactory.create({
      uuid: uuidv4(),
      user_uuid: dto.userUuid,
      shared_vault_uuid: dto.sharedVaultUuid,
      permissions: dto.permissions,
      created_at_timestamp: timestamp,
      updated_at_timestamp: timestamp,
    })

    return this.sharedVaultUserRepository.create(sharedVaultUser)
  }

  getAllSharedVaultUsersForUser(dto: GetSharedVaultUsersDTO): Promise<SharedVaultUser[]> {
    return this.sharedVaultUserRepository.findAllForUser(dto)
  }

  getUserForSharedVault(dto: { userUuid: string; sharedVaultUuid: string }): Promise<SharedVaultUser | null> {
    return this.sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid(dto.userUuid, dto.sharedVaultUuid)
  }

  async getSharedVaultUsersForSharedVault(dto: {
    sharedVaultUuid: string
    originatorUuid: string
  }): Promise<{ users: SharedVaultUser[]; isAdmin: boolean } | undefined> {
    const sharedVault = await this.sharedVaultRepository.findByUuid(dto.sharedVaultUuid)
    if (!sharedVault) {
      return undefined
    }

    const isUserSharedVaultAdmin = sharedVault && sharedVault.userUuid === dto.originatorUuid
    const doesUserBelongToSharedVault = await this.sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid(
      dto.originatorUuid,
      dto.sharedVaultUuid,
    )

    if (!isUserSharedVaultAdmin && !doesUserBelongToSharedVault) {
      return undefined
    }

    const users = await this.sharedVaultUserRepository.findAllForSharedVault({ sharedVaultUuid: dto.sharedVaultUuid })

    return {
      users,
      isAdmin: isUserSharedVaultAdmin,
    }
  }

  async deleteSharedVaultUser(dto: {
    originatorUuid: string
    sharedVaultUuid: string
    userUuid: string
  }): Promise<boolean> {
    const sharedVault = await this.sharedVaultRepository.findByUuid(dto.sharedVaultUuid)
    if (!sharedVault) {
      return false
    }

    if (sharedVault.userUuid === dto.userUuid) {
      return false
    }

    const isAuthorized = sharedVault.userUuid === dto.originatorUuid || dto.userUuid === dto.originatorUuid
    if (!isAuthorized) {
      return false
    }

    const sharedVaultUser = await this.sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid(
      dto.userUuid,
      dto.sharedVaultUuid,
    )
    if (!sharedVaultUser) {
      return false
    }

    await this.sharedVaultUserRepository.remove(sharedVaultUser)
    await this.removedSharedVaultUserService.addRemovedSharedVaultUser({
      sharedVaultUuid: dto.sharedVaultUuid,
      userUuid: dto.userUuid,
      removedBy: dto.originatorUuid,
    })

    return true
  }

  async deleteAllSharedVaultUsersForSharedVault(dto: {
    originatorUuid: string
    sharedVaultUuid: string
  }): Promise<boolean> {
    const sharedVault = await this.sharedVaultRepository.findByUuid(dto.sharedVaultUuid)
    if (!sharedVault || sharedVault.userUuid !== dto.originatorUuid) {
      return false
    }

    const sharedVaultUsers = await this.sharedVaultUserRepository.findAllForSharedVault({
      sharedVaultUuid: dto.sharedVaultUuid,
    })
    for (const sharedVaultUser of sharedVaultUsers) {
      await this.sharedVaultUserRepository.remove(sharedVaultUser)
      await this.removedSharedVaultUserService.addRemovedSharedVaultUser({
        sharedVaultUuid: dto.sharedVaultUuid,
        userUuid: sharedVaultUser.userUuid,
        removedBy: dto.originatorUuid,
      })
    }

    return true
  }
}

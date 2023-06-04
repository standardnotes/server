import { TimerInterface } from '@standardnotes/time'
import { SharedVault } from '../Model/SharedVault'
import { SharedVaultsRepositoryInterface } from '../Repository/SharedVaultRepositoryInterface'
import {
  CreateSharedVaultDTO,
  SharedVaultServiceInterface,
  UpdateSharedVaultDTO,
  CreateSharedVaultResult,
} from './SharedVaultServiceInterface'
import { SharedVaultFactoryInterface } from '../Factory/SharedVaultFactoryInterface'
import { SharedVaultUserServiceInterface } from '../../SharedVaultUser/Service/SharedVaultUserServiceInterface'
import { SharedVaultInviteServiceInterface } from '../../SharedVaultInvite/Service/SharedVaultInviteServiceInterface'
import { v4 as uuidv4 } from 'uuid'
import { UserEventServiceInterface } from '../../UserEvent/Service/UserEventServiceInterface'

export class SharedVaultService implements SharedVaultServiceInterface {
  constructor(
    private sharedVaultRepository: SharedVaultsRepositoryInterface,
    private sharedVaultFactory: SharedVaultFactoryInterface,
    private sharedVaultUserService: SharedVaultUserServiceInterface,
    private sharedVaultInviteService: SharedVaultInviteServiceInterface,
    private userEventService: UserEventServiceInterface,
    private timer: TimerInterface,
  ) {}

  async createSharedVault(dto: CreateSharedVaultDTO): Promise<CreateSharedVaultResult> {
    const timestamp = this.timer.getTimestampInMicroseconds()
    const sharedVault = this.sharedVaultFactory.create({
      userUuid: dto.userUuid,
      sharedVaultHash: {
        uuid: uuidv4(),
        user_uuid: dto.userUuid,
        specified_items_key_uuid: dto.specifiedItemsKeyUuid,
        file_upload_bytes_limit: 1_000_000,
        file_upload_bytes_used: 0,
        created_at_timestamp: timestamp,
        updated_at_timestamp: timestamp,
      },
    })

    const savedSharedVault = await this.sharedVaultRepository.create(sharedVault)

    const sharedVaultUser = await this.sharedVaultUserService.addSharedVaultUser({
      sharedVaultUuid: savedSharedVault.uuid,
      userUuid: dto.userUuid,
      permissions: 'admin',
    })

    return { sharedVault, sharedVaultUser }
  }

  async getSharedVault(dto: { sharedVaultUuid: string }): Promise<SharedVault | null> {
    const sharedVault = await this.sharedVaultRepository.findByUuid(dto.sharedVaultUuid)

    return sharedVault
  }

  async getSharedVaults(dto: { userUuid: string; lastSyncTime?: number }): Promise<SharedVault[]> {
    const sharedVaultUsers = await this.sharedVaultUserService.getAllSharedVaultUsersForUser({
      userUuid: dto.userUuid,
    })

    const sharedVaultUuids = sharedVaultUsers.map((sharedVaultUser) => sharedVaultUser.sharedVaultUuid)

    if (sharedVaultUuids.length === 0) {
      return []
    }

    return this.sharedVaultRepository.findAll({ sharedVaultUuids, lastSyncTime: dto.lastSyncTime })
  }

  async updateSharedVault(dto: UpdateSharedVaultDTO): Promise<SharedVault | null> {
    const sharedVault = await this.sharedVaultRepository.findByUuid(dto.sharedVaultUuid)
    if (!sharedVault || sharedVault.userUuid !== dto.originatorUuid) {
      return null
    }

    sharedVault.specifiedItemsKeyUuid = dto.specifiedItemsKeyUuid
    sharedVault.updatedAtTimestamp = this.timer.getTimestampInMicroseconds()

    const savedSharedVault = await this.sharedVaultRepository.save(sharedVault)

    return savedSharedVault
  }

  async deleteSharedVault(dto: { sharedVaultUuid: string; originatorUuid: string }): Promise<boolean> {
    const sharedVault = await this.sharedVaultRepository.findByUuid(dto.sharedVaultUuid)
    if (!sharedVault || sharedVault.userUuid !== dto.originatorUuid) {
      return false
    }

    await this.sharedVaultRepository.remove(sharedVault)

    const vaultUsersResult = await this.sharedVaultUserService.getSharedVaultUsersForSharedVault({
      sharedVaultUuid: dto.sharedVaultUuid,
      originatorUuid: dto.originatorUuid,
    })

    if (vaultUsersResult) {
      for (const user of vaultUsersResult.users) {
        await this.userEventService.createUserRemovedFromSharedVaultUserEvent({
          sharedVaultUuid: dto.sharedVaultUuid,
          userUuid: user.userUuid,
        })
      }
    }

    await this.sharedVaultUserService.deleteAllSharedVaultUsersForSharedVault({
      sharedVaultUuid: dto.sharedVaultUuid,
      originatorUuid: dto.originatorUuid,
    })

    await this.sharedVaultInviteService.deleteAllInvitesForSharedVault({
      sharedVaultUuid: dto.sharedVaultUuid,
      originatorUuid: dto.originatorUuid,
    })

    return true
  }
}

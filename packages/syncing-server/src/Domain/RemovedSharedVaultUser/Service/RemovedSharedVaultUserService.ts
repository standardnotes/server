import { TimerInterface } from '@standardnotes/time'
import { RemovedSharedVaultUser } from '../Model/RemovedSharedVaultUser'
import { RemovedSharedVaultUserFactoryInterface } from '../Factory/RemovedSharedVaultUserFactoryInterface'
import { v4 as uuidv4 } from 'uuid'
import { RemovedSharedVaultUserRepositoryInterface } from '../Repository/RemovedSharedVaultUserRepositoryInterface'
import { RemovedSharedVaultUserServiceInterface } from './RemovedSharedVaultUserServiceInterface'
import { GetRemovedSharedVaultUsersDTO } from './GetRemovedSharedVaultUsersDTO'
import { SharedVaultsRepositoryInterface } from '../../SharedVault/Repository/SharedVaultRepositoryInterface'

export class RemovedSharedVaultUserService implements RemovedSharedVaultUserServiceInterface {
  constructor(
    private sharedVaultRepository: SharedVaultsRepositoryInterface,
    private removedSharedVaultUserRepository: RemovedSharedVaultUserRepositoryInterface,
    private removedSharedVaultUserFactory: RemovedSharedVaultUserFactoryInterface,
    private timer: TimerInterface,
  ) {}

  async addRemovedSharedVaultUser(dto: {
    sharedVaultUuid: string
    userUuid: string
    removedBy: string
  }): Promise<RemovedSharedVaultUser | null> {
    const sharedVault = await this.sharedVaultRepository.findByUuid(dto.sharedVaultUuid)
    if (!sharedVault) {
      return null
    }

    const timestamp = this.timer.getTimestampInMicroseconds()
    const removedSharedVaultUser = this.removedSharedVaultUserFactory.create({
      uuid: uuidv4(),
      user_uuid: dto.userUuid,
      shared_vault_uuid: dto.sharedVaultUuid,
      removed_by: dto.removedBy,
      created_at_timestamp: timestamp,
      updated_at_timestamp: timestamp,
    })

    return this.removedSharedVaultUserRepository.create(removedSharedVaultUser)
  }

  getAllRemovedSharedVaultUsersForUser(dto: GetRemovedSharedVaultUsersDTO): Promise<RemovedSharedVaultUser[]> {
    return this.removedSharedVaultUserRepository.findAllForUser(dto)
  }

  async deleteRemovedSharedVaultUser(dto: { sharedVaultUuid: string; userUuid: string }): Promise<boolean> {
    const removedSharedVaultUser = await this.removedSharedVaultUserRepository.findByUserUuidAndSharedVaultUuid(
      dto.userUuid,
      dto.sharedVaultUuid,
    )
    if (!removedSharedVaultUser) {
      return false
    }

    await this.removedSharedVaultUserRepository.remove(removedSharedVaultUser)

    return true
  }
}

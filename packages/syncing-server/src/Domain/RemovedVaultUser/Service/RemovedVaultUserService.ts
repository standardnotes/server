import { TimerInterface } from '@standardnotes/time'
import { RemovedVaultUser } from '../Model/RemovedVaultUser'
import { RemovedVaultUserFactoryInterface } from '../Factory/RemovedVaultUserFactoryInterface'
import { v4 as uuidv4 } from 'uuid'
import { RemovedVaultUserRepositoryInterface } from '../Repository/RemovedVaultUserRepositoryInterface'
import { RemovedVaultUserServiceInterface } from './RemovedVaultUserServiceInterface'
import { GetRemovedVaultUsersDTO } from './GetRemovedVaultUsersDTO'
import { VaultsRepositoryInterface } from '../../Vault/Repository/VaultRepositoryInterface'

export class RemovedVaultUserService implements RemovedVaultUserServiceInterface {
  constructor(
    private vaultRepository: VaultsRepositoryInterface,
    private removedVaultUserRepository: RemovedVaultUserRepositoryInterface,
    private removedVaultUserFactory: RemovedVaultUserFactoryInterface,
    private timer: TimerInterface,
  ) {}

  async addRemovedVaultUser(dto: {
    vaultUuid: string
    userUuid: string
    removedBy: string
  }): Promise<RemovedVaultUser | null> {
    const vault = await this.vaultRepository.findByUuid(dto.vaultUuid)
    if (!vault) {
      return null
    }

    const timestamp = this.timer.getTimestampInMicroseconds()
    const removedVaultUser = this.removedVaultUserFactory.create({
      uuid: uuidv4(),
      user_uuid: dto.userUuid,
      vault_uuid: dto.vaultUuid,
      removed_by: dto.removedBy,
      created_at_timestamp: timestamp,
      updated_at_timestamp: timestamp,
    })

    return this.removedVaultUserRepository.create(removedVaultUser)
  }

  getAllRemovedVaultUsersForUser(dto: GetRemovedVaultUsersDTO): Promise<RemovedVaultUser[]> {
    return this.removedVaultUserRepository.findAllForUser(dto)
  }

  async deleteRemovedVaultUser(dto: { vaultUuid: string; userUuid: string }): Promise<boolean> {
    const removedVaultUser = await this.removedVaultUserRepository.findByUserUuidAndVaultUuid(
      dto.userUuid,
      dto.vaultUuid,
    )
    if (!removedVaultUser) {
      return false
    }

    await this.removedVaultUserRepository.remove(removedVaultUser)

    return true
  }
}

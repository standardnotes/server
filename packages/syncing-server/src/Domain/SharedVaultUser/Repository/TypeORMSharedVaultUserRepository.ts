import { SharedVaultUser } from '../Model/SharedVaultUser'
import { Repository, SelectQueryBuilder } from 'typeorm'
import {
  SharedVaultUserFindAllForSharedVault,
  SharedVaultUserFindAllForUserQuery,
  SharedVaultUserRepositoryInterface,
} from './SharedVaultUserRepositoryInterface'

export class TypeORMSharedVaultUserRepository implements SharedVaultUserRepositoryInterface {
  constructor(private ormRepository: Repository<SharedVaultUser>) {}

  async create(sharedVaultUser: SharedVaultUser): Promise<SharedVaultUser> {
    return this.ormRepository.save(sharedVaultUser)
  }

  async save(sharedVaultUser: SharedVaultUser): Promise<SharedVaultUser> {
    return this.ormRepository.save(sharedVaultUser)
  }

  findByUuid(uuid: string): Promise<SharedVaultUser | null> {
    return this.ormRepository
      .createQueryBuilder('shared_vault_user')
      .where('shared_vault_user.uuid = :uuid', {
        uuid,
      })
      .getOne()
  }

  findByUserUuidAndSharedVaultUuid(userUuid: string, sharedVaultUuid: string): Promise<SharedVaultUser | null> {
    return this.ormRepository
      .createQueryBuilder('shared_vault_user')
      .where('shared_vault_user.user_uuid = :userUuid', { userUuid })
      .andWhere('shared_vault_user.shared_vault_uuid = :sharedVaultUuid', { sharedVaultUuid })
      .getOne()
  }

  async remove(sharedVaultUser: SharedVaultUser): Promise<SharedVaultUser> {
    return this.ormRepository.remove(sharedVaultUser)
  }

  findAllForSharedVault(query: SharedVaultUserFindAllForSharedVault): Promise<SharedVaultUser[]> {
    return this.ormRepository
      .createQueryBuilder('shared_vault_user')
      .where('shared_vault_user.shared_vault_uuid = :sharedVaultUuid', { sharedVaultUuid: query.sharedVaultUuid })
      .getMany()
  }

  async findAllForUser(query: SharedVaultUserFindAllForUserQuery): Promise<SharedVaultUser[]> {
    return this.createFindAllQueryBuilder(query).getMany()
  }

  private createFindAllQueryBuilder(query: SharedVaultUserFindAllForUserQuery): SelectQueryBuilder<SharedVaultUser> {
    const queryBuilder = this.ormRepository.createQueryBuilder('shared_vault_user')

    queryBuilder.where('shared_vault_user.user_uuid = :userUuid', { userUuid: query.userUuid })

    if (query.lastSyncTime) {
      queryBuilder.andWhere('shared_vault_user.updated_at_timestamp > :lastSyncTime', {
        lastSyncTime: query.lastSyncTime,
      })
    }

    return queryBuilder
  }
}

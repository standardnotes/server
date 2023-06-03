import { RemovedSharedVaultUser } from '../Model/RemovedSharedVaultUser'
import { Repository, SelectQueryBuilder } from 'typeorm'
import {
  RemovedSharedVaultUserFindAllForUserQuery,
  RemovedSharedVaultUserRepositoryInterface,
} from './RemovedSharedVaultUserRepositoryInterface'

export class TypeORMRemovedSharedVaultUserRepository implements RemovedSharedVaultUserRepositoryInterface {
  constructor(private ormRepository: Repository<RemovedSharedVaultUser>) {}

  async create(removedSharedVaultUser: RemovedSharedVaultUser): Promise<RemovedSharedVaultUser> {
    return this.ormRepository.save(removedSharedVaultUser)
  }

  findByUserUuidAndSharedVaultUuid(userUuid: string, sharedVaultUuid: string): Promise<RemovedSharedVaultUser | null> {
    return this.ormRepository
      .createQueryBuilder('removed_shared_vault_user')
      .where('removed_shared_vault_user.user_uuid = :userUuid', { userUuid })
      .andWhere('removed_shared_vault_user.shared_vault_uuid = :sharedVaultUuid', { sharedVaultUuid })
      .getOne()
  }

  async remove(removedSharedVaultUser: RemovedSharedVaultUser): Promise<RemovedSharedVaultUser> {
    return this.ormRepository.remove(removedSharedVaultUser)
  }

  async findAllForUser(query: RemovedSharedVaultUserFindAllForUserQuery): Promise<RemovedSharedVaultUser[]> {
    return this.createFindAllQueryBuilder(query).getMany()
  }

  private createFindAllQueryBuilder(query: RemovedSharedVaultUserFindAllForUserQuery): SelectQueryBuilder<RemovedSharedVaultUser> {
    const queryBuilder = this.ormRepository.createQueryBuilder('removed_shared_vault_user')

    queryBuilder.where('removed_shared_vault_user.user_uuid = :userUuid', { userUuid: query.userUuid })

    return queryBuilder
  }
}

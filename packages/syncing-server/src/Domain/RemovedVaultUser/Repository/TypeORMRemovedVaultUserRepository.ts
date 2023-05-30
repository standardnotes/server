import { RemovedVaultUser } from '../Model/RemovedVaultUser'
import { Repository, SelectQueryBuilder } from 'typeorm'
import {
  RemovedVaultUserFindAllForUserQuery,
  RemovedVaultUserRepositoryInterface,
} from './RemovedVaultUserRepositoryInterface'

export class TypeORMRemovedVaultUserRepository implements RemovedVaultUserRepositoryInterface {
  constructor(private ormRepository: Repository<RemovedVaultUser>) {}

  async create(removedVaultUser: RemovedVaultUser): Promise<RemovedVaultUser> {
    return this.ormRepository.save(removedVaultUser)
  }

  findByUserUuidAndVaultUuid(userUuid: string, vaultUuid: string): Promise<RemovedVaultUser | null> {
    return this.ormRepository
      .createQueryBuilder('removed_vault_user')
      .where('removed_vault_user.user_uuid = :userUuid', { userUuid })
      .andWhere('removed_vault_user.vault_uuid = :vaultUuid', { vaultUuid })
      .getOne()
  }

  async remove(removedVaultUser: RemovedVaultUser): Promise<RemovedVaultUser> {
    return this.ormRepository.remove(removedVaultUser)
  }

  async findAllForUser(query: RemovedVaultUserFindAllForUserQuery): Promise<RemovedVaultUser[]> {
    return this.createFindAllQueryBuilder(query).getMany()
  }

  private createFindAllQueryBuilder(query: RemovedVaultUserFindAllForUserQuery): SelectQueryBuilder<RemovedVaultUser> {
    const queryBuilder = this.ormRepository.createQueryBuilder('removed_vault_user')

    queryBuilder.where('removed_vault_user.user_uuid = :userUuid', { userUuid: query.userUuid })

    return queryBuilder
  }
}

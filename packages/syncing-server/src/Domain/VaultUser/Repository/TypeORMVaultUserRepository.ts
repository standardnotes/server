import { VaultUser } from '../Model/VaultUser'
import { Repository, SelectQueryBuilder } from 'typeorm'
import {
  VaultUserFindAllForVault,
  VaultUserFindAllForUserQuery,
  VaultUserRepositoryInterface,
} from './VaultUserRepositoryInterface'

export class TypeORMVaultUserRepository implements VaultUserRepositoryInterface {
  constructor(private ormRepository: Repository<VaultUser>) {}

  async create(vaultUser: VaultUser): Promise<VaultUser> {
    return this.ormRepository.save(vaultUser)
  }

  async save(vaultUser: VaultUser): Promise<VaultUser> {
    return this.ormRepository.save(vaultUser)
  }

  findByUuid(uuid: string): Promise<VaultUser | null> {
    return this.ormRepository
      .createQueryBuilder('vault_user')
      .where('vault_user.uuid = :uuid', {
        uuid,
      })
      .getOne()
  }

  findByUserUuidAndVaultUuid(userUuid: string, vaultUuid: string): Promise<VaultUser | null> {
    return this.ormRepository
      .createQueryBuilder('vault_user')
      .where('vault_user.user_uuid = :userUuid', { userUuid })
      .andWhere('vault_user.vault_uuid = :vaultUuid', { vaultUuid })
      .getOne()
  }

  async remove(vaultUser: VaultUser): Promise<VaultUser> {
    return this.ormRepository.remove(vaultUser)
  }

  findAllForVault(query: VaultUserFindAllForVault): Promise<VaultUser[]> {
    return this.ormRepository
      .createQueryBuilder('vault_user')
      .where('vault_user.vault_uuid = :vaultUuid', { vaultUuid: query.vaultUuid })
      .getMany()
  }

  async findAllForUser(query: VaultUserFindAllForUserQuery): Promise<VaultUser[]> {
    return this.createFindAllQueryBuilder(query).getMany()
  }

  private createFindAllQueryBuilder(query: VaultUserFindAllForUserQuery): SelectQueryBuilder<VaultUser> {
    const queryBuilder = this.ormRepository.createQueryBuilder('vault_user')

    queryBuilder.where('vault_user.user_uuid = :userUuid', { userUuid: query.userUuid })

    if (query.lastSyncTime) {
      queryBuilder.andWhere('vault_user.updated_at_timestamp > :lastSyncTime', {
        lastSyncTime: query.lastSyncTime,
      })
    }

    return queryBuilder
  }
}

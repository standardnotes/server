import { Repository, SelectQueryBuilder } from 'typeorm'
import { VaultsRepositoryInterface, UserVaultsQuery } from './VaultRepositoryInterface'
import { Vault } from '../Model/Vault'

export class TypeORMVaultRepository implements VaultsRepositoryInterface {
  constructor(private ormRepository: Repository<Vault>) {}

  async create(vault: Vault): Promise<Vault> {
    return this.ormRepository.save(vault)
  }

  async save(vault: Vault): Promise<Vault> {
    return this.ormRepository.save(vault)
  }

  findByUuid(uuid: string): Promise<Vault | null> {
    return this.ormRepository
      .createQueryBuilder('vault')
      .where('vault.uuid = :uuid', {
        uuid,
      })
      .getOne()
  }

  async remove(vault: Vault): Promise<Vault> {
    return this.ormRepository.remove(vault)
  }

  async findAll(query: UserVaultsQuery): Promise<Vault[]> {
    return this.createFindAllQueryBuilder(query).getMany()
  }

  private createFindAllQueryBuilder(query: UserVaultsQuery): SelectQueryBuilder<Vault> {
    const queryBuilder = this.ormRepository.createQueryBuilder('vault')

    if (!query.userUuid && !query.vaultUuids) {
      throw new Error('Either userUuid or vaultUuids must be provided')
    }

    if (query.userUuid) {
      queryBuilder.where('vault.user_uuid = :userUuid', { userUuid: query.userUuid })
    }

    if (query.vaultUuids) {
      queryBuilder.where('vault.uuid IN (:...vaultUuids)', { vaultUuids: query.vaultUuids })
    }

    if (query.lastSyncTime) {
      queryBuilder.andWhere('vault.updated_at_timestamp > :lastSyncTime', {
        lastSyncTime: query.lastSyncTime,
      })
    }

    return queryBuilder
  }
}

import { Repository, SelectQueryBuilder } from 'typeorm'
import { SharedVaultsRepositoryInterface, UserSharedVaultsQuery } from './SharedVaultRepositoryInterface'
import { SharedVault } from '../Model/SharedVault'

export class TypeORMSharedVaultRepository implements SharedVaultsRepositoryInterface {
  constructor(private ormRepository: Repository<SharedVault>) {}

  async create(sharedVault: SharedVault): Promise<SharedVault> {
    return this.ormRepository.save(sharedVault)
  }

  async save(sharedVault: SharedVault): Promise<SharedVault> {
    return this.ormRepository.save(sharedVault)
  }

  findByUuid(uuid: string): Promise<SharedVault | null> {
    return this.ormRepository
      .createQueryBuilder('shared_vault')
      .where('shared_vault.uuid = :uuid', {
        uuid,
      })
      .getOne()
  }

  async remove(sharedVault: SharedVault): Promise<SharedVault> {
    return this.ormRepository.remove(sharedVault)
  }

  async findAll(query: UserSharedVaultsQuery): Promise<SharedVault[]> {
    return this.createFindAllQueryBuilder(query).getMany()
  }

  private createFindAllQueryBuilder(query: UserSharedVaultsQuery): SelectQueryBuilder<SharedVault> {
    const queryBuilder = this.ormRepository.createQueryBuilder('shared_vault')

    if (!query.userUuid && !query.sharedVaultUuids) {
      throw new Error('Either userUuid or sharedVaultUuids must be provided')
    }

    if (query.userUuid) {
      queryBuilder.where('shared_vault.user_uuid = :userUuid', { userUuid: query.userUuid })
    }

    if (query.sharedVaultUuids) {
      queryBuilder.where('shared_vault.uuid IN (:...sharedVaultUuids)', { sharedVaultUuids: query.sharedVaultUuids })
    }

    if (query.lastSyncTime) {
      queryBuilder.andWhere('shared_vault.updated_at_timestamp > :lastSyncTime', {
        lastSyncTime: query.lastSyncTime,
      })
    }

    return queryBuilder
  }
}

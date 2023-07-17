import { Repository } from 'typeorm'
import { MapperInterface, Uuid } from '@standardnotes/domain-core'

import { SharedVaultRepositoryInterface } from '../../Domain/SharedVault/SharedVaultRepositoryInterface'
import { TypeORMSharedVault } from './TypeORMSharedVault'
import { SharedVault } from '../../Domain/SharedVault/SharedVault'
import { SharedVaultItemRepositoryInterface } from '../../Domain/SharedVault/Item/SharedVaultItemRepositoryInterface'

export class TypeORMSharedVaultRepository implements SharedVaultRepositoryInterface {
  constructor(
    private ormRepository: Repository<TypeORMSharedVault>,
    private sharedVaultItemRepository: SharedVaultItemRepositoryInterface,
    private mapper: MapperInterface<SharedVault, TypeORMSharedVault>,
  ) {}

  async findByUuids(uuids: Uuid[], lastSyncTime?: number | undefined): Promise<SharedVault[]> {
    const queryBuilder = this.ormRepository
      .createQueryBuilder('shared_vault')
      .where('shared_vault.uuid IN (:...sharedVaultUuids)', { sharedVaultUuids: uuids.map((uuid) => uuid.value) })

    if (lastSyncTime !== undefined) {
      queryBuilder.andWhere('shared_vault.updated_at_timestamp > :lastSyncTime', { lastSyncTime })
    }

    const persistence = await queryBuilder.getMany()

    return persistence.map((p) => this.mapper.toDomain(p))
  }

  async save(sharedVault: SharedVault): Promise<void> {
    for (const item of sharedVault.props.sharedVaultItems) {
      await this.sharedVaultItemRepository.save(item)
    }

    const persistence = this.mapper.toProjection(sharedVault)

    await this.ormRepository.save(persistence)
  }

  async findByUuid(uuid: Uuid): Promise<SharedVault | null> {
    const persistence = await this.ormRepository
      .createQueryBuilder('shared_vault')
      .where('shared_vault.uuid = :uuid', {
        uuid: uuid.value,
      })
      .getOne()

    if (persistence === null) {
      return null
    }

    return this.mapper.toDomain(persistence)
  }

  async remove(sharedVault: SharedVault): Promise<void> {
    await this.ormRepository.remove(this.mapper.toProjection(sharedVault))
  }
}

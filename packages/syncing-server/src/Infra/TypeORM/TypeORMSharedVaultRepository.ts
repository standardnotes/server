import { Repository } from 'typeorm'
import { MapperInterface, Uuid } from '@standardnotes/domain-core'

import { SharedVaultRepositoryInterface } from '../../Domain/SharedVault/SharedVaultRepositoryInterface'
import { TypeORMSharedVault } from './TypeORMSharedVault'
import { SharedVault } from '../../Domain/SharedVault/SharedVault'

export class TypeORMSharedVaultRepository implements SharedVaultRepositoryInterface {
  constructor(
    private ormRepository: Repository<TypeORMSharedVault>,
    private mapper: MapperInterface<SharedVault, TypeORMSharedVault>,
  ) {}

  async findByUserUuid(userUuid: Uuid): Promise<SharedVault[]> {
    const persistence = await this.ormRepository
      .createQueryBuilder('shared_vault')
      .where('shared_vault.user_uuid = :userUuid', {
        userUuid: userUuid.value,
      })
      .getMany()

    return persistence.map((p) => this.mapper.toDomain(p))
  }

  async countByUserUuid(userUuid: Uuid): Promise<number> {
    const count = await this.ormRepository
      .createQueryBuilder('shared_vault')
      .where('shared_vault.user_uuid = :userUuid', {
        userUuid: userUuid.value,
      })
      .getCount()

    return count
  }

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

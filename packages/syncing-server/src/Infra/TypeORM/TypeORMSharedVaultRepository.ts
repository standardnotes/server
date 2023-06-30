import { Repository } from 'typeorm'
import { MapperInterface } from '@standardnotes/domain-core'

import { SharedVaultsRepositoryInterface } from '../../Domain/SharedVault/SharedVaultsRepositoryInterface'
import { TypeORMSharedVault } from './TypeORMSharedVault'
import { SharedVault } from '../../Domain/SharedVault/SharedVault'

export class TypeORMSharedVaultRepository implements SharedVaultsRepositoryInterface {
  constructor(
    private ormRepository: Repository<TypeORMSharedVault>,
    private mapper: MapperInterface<SharedVault, TypeORMSharedVault>,
  ) {}

  async save(sharedVault: SharedVault): Promise<void> {
    const persistence = this.mapper.toProjection(sharedVault)

    await this.ormRepository.save(persistence)
  }

  async findByUuid(uuid: string): Promise<SharedVault | null> {
    const persistence = await this.ormRepository
      .createQueryBuilder('shared_vault')
      .where('shared_vault.uuid = :uuid', {
        uuid,
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

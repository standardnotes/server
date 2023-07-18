import { Repository } from 'typeorm'
import { MapperInterface, Uuid } from '@standardnotes/domain-core'

import { SharedVaultAssociation } from '../../Domain/SharedVault/SharedVaultAssociation'
import { SharedVaultAssociationRepositoryInterface } from '../../Domain/SharedVault/SharedVaultAssociationRepositoryInterface'
import { TypeORMSharedVaultAssociation } from './TypeORMSharedVaultAssociation'

export class TypeORMSharedVaultAssociationRepository implements SharedVaultAssociationRepositoryInterface {
  constructor(
    private ormRepository: Repository<TypeORMSharedVaultAssociation>,
    private mapper: MapperInterface<SharedVaultAssociation, TypeORMSharedVaultAssociation>,
  ) {}

  async findByItemUuid(itemUuid: Uuid): Promise<SharedVaultAssociation | null> {
    const persistence = await this.ormRepository
      .createQueryBuilder('shared_vault_association')
      .where('shared_vault_association.item_uuid = :itemUuid', {
        itemUuid: itemUuid.value,
      })
      .getOne()

    if (persistence === null) {
      return null
    }

    return this.mapper.toDomain(persistence)
  }

  async save(sharedVaultAssociation: SharedVaultAssociation): Promise<void> {
    await this.ormRepository.save(this.mapper.toProjection(sharedVaultAssociation))
  }

  async remove(sharedVaultAssociation: SharedVaultAssociation): Promise<void> {
    await this.ormRepository.remove(this.mapper.toProjection(sharedVaultAssociation))
  }
}

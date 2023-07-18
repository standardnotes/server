import { Repository } from 'typeorm'
import { MapperInterface, Uuid } from '@standardnotes/domain-core'

import { KeySystemAssociation } from '../../Domain/KeySystem/KeySystemAssociation'
import { KeySystemAssociationRepositoryInterface } from '../../Domain/KeySystem/KeySystemAssociationRepositoryInterface'
import { TypeORMKeySystemAssociation } from './TypeORMKeySystemAssociation'

export class TypeORMKeySystemAssociationRepository implements KeySystemAssociationRepositoryInterface {
  constructor(
    private ormRepository: Repository<TypeORMKeySystemAssociation>,
    private mapper: MapperInterface<KeySystemAssociation, TypeORMKeySystemAssociation>,
  ) {}

  async findByItemUuid(itemUuid: Uuid): Promise<KeySystemAssociation | null> {
    const persistence = await this.ormRepository
      .createQueryBuilder('key_system_association')
      .where('key_system_association.item_uuid = :itemUuid', {
        itemUuid: itemUuid.value,
      })
      .getOne()

    if (persistence === null) {
      return null
    }

    return this.mapper.toDomain(persistence)
  }

  async save(keySystemAssociation: KeySystemAssociation): Promise<void> {
    await this.ormRepository.save(this.mapper.toProjection(keySystemAssociation))
  }

  async remove(keySystemAssociation: KeySystemAssociation): Promise<void> {
    await this.ormRepository.remove(this.mapper.toProjection(keySystemAssociation))
  }
}

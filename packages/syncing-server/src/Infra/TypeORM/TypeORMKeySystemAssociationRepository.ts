import { Repository } from 'typeorm'
import { MapperInterface } from '@standardnotes/domain-core'

import { KeySystemAssociation } from '../../Domain/KeySystem/KeySystemAssociation'
import { KeySystemAssociationRepositoryInterface } from '../../Domain/KeySystem/KeySystemAssociationRepositoryInterface'
import { TypeORMKeySystemAssociation } from './TypeORMKeySystemAssociation'

export class TypeORMKeySystemAssociationRepository implements KeySystemAssociationRepositoryInterface {
  constructor(
    private ormRepository: Repository<TypeORMKeySystemAssociation>,
    private mapper: MapperInterface<KeySystemAssociation, TypeORMKeySystemAssociation>,
  ) {}

  async save(keySystemAssociation: KeySystemAssociation): Promise<void> {
    await this.ormRepository.save(this.mapper.toProjection(keySystemAssociation))
  }

  async remove(keySystemAssociation: KeySystemAssociation): Promise<void> {
    await this.ormRepository.remove(this.mapper.toProjection(keySystemAssociation))
  }
}

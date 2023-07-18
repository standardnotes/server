import { Repository } from 'typeorm'
import { MapperInterface } from '@standardnotes/domain-core'

import { SharedVaultAssociation } from '../../Domain/SharedVault/SharedVaultAssociation'
import { SharedVaultAssociationRepositoryInterface } from '../../Domain/SharedVault/SharedVaultAssociationRepositoryInterface'
import { TypeORMSharedVaultAssociation } from './TypeORMSharedVaultAssociation'

export class TypeORMSharedVaultAssociationRepository implements SharedVaultAssociationRepositoryInterface {
  constructor(
    private ormRepository: Repository<TypeORMSharedVaultAssociation>,
    private mapper: MapperInterface<SharedVaultAssociation, TypeORMSharedVaultAssociation>,
  ) {}

  async save(sharedVaultAssociation: SharedVaultAssociation): Promise<void> {
    await this.ormRepository.save(this.mapper.toProjection(sharedVaultAssociation))
  }

  async remove(sharedVaultAssociation: SharedVaultAssociation): Promise<void> {
    await this.ormRepository.remove(this.mapper.toProjection(sharedVaultAssociation))
  }
}

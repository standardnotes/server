import { Repository } from 'typeorm'
import { MapperInterface, UniqueEntityId } from '@standardnotes/domain-core'

import { SharedVaultItem } from '../../Domain/SharedVault/Item/SharedVaultItem'
import { SharedVaultItemRepositoryInterface } from '../../Domain/SharedVault/Item/SharedVaultItemRepositoryInterface'
import { TypeORMSharedVaultItem } from './TypeORMSharedVaultItem'

export class TypeORMSharedVaultItemRepository implements SharedVaultItemRepositoryInterface {
  constructor(
    private ormRepository: Repository<TypeORMSharedVaultItem>,
    private mapper: MapperInterface<SharedVaultItem, TypeORMSharedVaultItem>,
  ) {}

  async findBySharedVaultId(sharedVaultId: UniqueEntityId): Promise<SharedVaultItem[]> {
    const persistence = await this.ormRepository
      .createQueryBuilder('shared_vault_item')
      .where('shared_vault_item.shared_vault_uuid = :sharedVaultUuid', {
        sharedVaultUuid: sharedVaultId.toString(),
      })
      .getMany()

    return persistence.map((p) => this.mapper.toDomain(p))
  }

  async save(sharedVaultItem: SharedVaultItem): Promise<void> {
    const persistence = this.mapper.toProjection(sharedVaultItem)

    await this.ormRepository.save(persistence)
  }
}

import { ReadStream } from 'fs'
import { Repository, SelectQueryBuilder, Brackets } from 'typeorm'
import { Change, MapperInterface, Uuid } from '@standardnotes/domain-core'
import { Logger } from 'winston'

import { Item } from '../../Domain/Item/Item'
import { ItemQuery } from '../../Domain/Item/ItemQuery'
import { ItemRepositoryInterface } from '../../Domain/Item/ItemRepositoryInterface'
import { ExtendedIntegrityPayload } from '../../Domain/Item/ExtendedIntegrityPayload'
import { TypeORMItem } from './TypeORMItem'
import { KeySystemAssociationRepositoryInterface } from '../../Domain/KeySystem/KeySystemAssociationRepositoryInterface'
import { SharedVaultAssociationRepositoryInterface } from '../../Domain/SharedVault/SharedVaultAssociationRepositoryInterface'
import { TypeORMSharedVaultAssociation } from './TypeORMSharedVaultAssociation'
import { SharedVaultAssociation } from '../../Domain/SharedVault/SharedVaultAssociation'
import { KeySystemAssociation } from '../../Domain/KeySystem/KeySystemAssociation'

export class TypeORMItemRepository implements ItemRepositoryInterface {
  constructor(
    private ormRepository: Repository<TypeORMItem>,
    private mapper: MapperInterface<Item, TypeORMItem>,
    private keySystemAssociationRepository: KeySystemAssociationRepositoryInterface,
    private sharedVaultAssociationRepository: SharedVaultAssociationRepositoryInterface,
    private logger: Logger,
  ) {}

  async save(item: Item): Promise<void> {
    const persistence = this.mapper.toProjection(item)

    await this.ormRepository.save(persistence)

    await this.persistAssociationChanges(item)
  }

  async remove(item: Item): Promise<void> {
    if (item.props.keySystemAssociation) {
      await this.keySystemAssociationRepository.remove(item.props.keySystemAssociation)
    }

    if (item.props.sharedVaultAssociation) {
      await this.sharedVaultAssociationRepository.remove(item.props.sharedVaultAssociation)
    }

    await this.ormRepository.remove(this.mapper.toProjection(item))
  }

  async updateContentSize(itemUuid: string, contentSize: number): Promise<void> {
    await this.ormRepository
      .createQueryBuilder('item')
      .update()
      .set({
        contentSize,
      })
      .where('uuid = :itemUuid', {
        itemUuid,
      })
      .execute()
  }

  async findContentSizeForComputingTransferLimit(
    query: ItemQuery,
  ): Promise<{ uuid: string; contentSize: number | null }[]> {
    const queryBuilder = this.createFindAllQueryBuilder(query)
    queryBuilder.select('item.uuid', 'uuid')
    queryBuilder.addSelect('item.content_size', 'contentSize')

    const items = await queryBuilder.getRawMany()

    return items
  }

  async deleteByUserUuid(userUuid: string): Promise<void> {
    await this.ormRepository
      .createQueryBuilder('item')
      .delete()
      .from('items')
      .where('user_uuid = :userUuid', { userUuid })
      .execute()
  }

  async findByUuid(uuid: Uuid, noAssociations: boolean): Promise<Item | null> {
    const persistence = await this.ormRepository
      .createQueryBuilder('item')
      .where('item.uuid = :uuid', {
        uuid: uuid.value,
      })
      .getOne()

    if (persistence === null) {
      return null
    }

    try {
      const item = this.mapper.toDomain(persistence)

      if (noAssociations) {
        return item
      }

      await this.decorateItemWithAssociations(item)

      return item
    } catch (error) {
      this.logger.error(`Failed to find item ${uuid.value} by uuid: ${(error as Error).message}`)

      return null
    }
  }

  async findDatesForComputingIntegrityHash(userUuid: string): Promise<Array<{ updated_at_timestamp: number }>> {
    const queryBuilder = this.ormRepository.createQueryBuilder('item')
    queryBuilder.select('item.updated_at_timestamp')
    queryBuilder.where('item.user_uuid = :userUuid', { userUuid: userUuid })
    queryBuilder.andWhere('item.deleted = :deleted', { deleted: false })

    const items = await queryBuilder.getRawMany()

    return items.sort((itemA, itemB) => itemB.updated_at_timestamp - itemA.updated_at_timestamp)
  }

  async findItemsForComputingIntegrityPayloads(userUuid: string): Promise<ExtendedIntegrityPayload[]> {
    const queryBuilder = this.ormRepository.createQueryBuilder('item')
    queryBuilder.select('item.uuid', 'uuid')
    queryBuilder.addSelect('item.updated_at_timestamp', 'updated_at_timestamp')
    queryBuilder.addSelect('item.content_type', 'content_type')
    queryBuilder.where('item.user_uuid = :userUuid', { userUuid: userUuid })
    queryBuilder.andWhere('item.deleted = :deleted', { deleted: false })

    const items = await queryBuilder.getRawMany()

    return items.sort((itemA, itemB) => itemB.updated_at_timestamp - itemA.updated_at_timestamp)
  }

  async findByUuidAndUserUuid(uuid: string, userUuid: string): Promise<Item | null> {
    const persistence = await this.ormRepository
      .createQueryBuilder('item')
      .where('item.uuid = :uuid AND item.user_uuid = :userUuid', {
        uuid,
        userUuid,
      })
      .getOne()

    if (persistence === null) {
      return null
    }

    try {
      const item = this.mapper.toDomain(persistence)

      await this.decorateItemWithAssociations(item)

      return item
    } catch (error) {
      this.logger.error(`Failed to find item ${uuid} by uuid and userUuid: ${(error as Error).message}`)

      return null
    }
  }

  async findAll(query: ItemQuery): Promise<Item[]> {
    const persistence = await this.createFindAllQueryBuilder(query).getMany()

    const domainItems: Item[] = []
    for (const persistencItem of persistence) {
      try {
        domainItems.push(this.mapper.toDomain(persistencItem))
      } catch (error) {
        this.logger.error(`Failed to map item ${persistencItem.uuid} to domain: ${(error as Error).message}`)
      }
    }

    await Promise.all(domainItems.map((item) => this.decorateItemWithAssociations(item)))

    return domainItems
  }

  async findAllRaw<T>(query: ItemQuery): Promise<T[]> {
    return this.createFindAllQueryBuilder(query).getRawMany<T>()
  }

  async streamAll(query: ItemQuery): Promise<ReadStream> {
    return this.createFindAllQueryBuilder(query).stream()
  }

  async countAll(query: ItemQuery): Promise<number> {
    return this.createFindAllQueryBuilder(query).getCount()
  }

  async markItemsAsDeleted(itemUuids: Array<string>, updatedAtTimestamp: number): Promise<void> {
    await this.ormRepository
      .createQueryBuilder('item')
      .update()
      .set({
        deleted: true,
        content: null,
        encItemKey: null,
        authHash: null,
        updatedAtTimestamp,
      })
      .where('uuid IN (:...uuids)', {
        uuids: itemUuids,
      })
      .execute()
  }

  private createFindAllQueryBuilder(query: ItemQuery): SelectQueryBuilder<TypeORMItem> {
    const queryBuilder = this.ormRepository.createQueryBuilder('item')

    if (query.sortBy !== undefined && query.sortOrder !== undefined) {
      queryBuilder.orderBy(`item.${query.sortBy}`, query.sortOrder)
    }

    if (query.includeSharedVaultUuids !== undefined && query.includeSharedVaultUuids.length > 0) {
      queryBuilder
        .leftJoin(
          TypeORMSharedVaultAssociation,
          'sharedVaultAssociation',
          'sharedVaultAssociation.itemUuid = item.uuid',
        )
        .where(
          new Brackets((qb) => {
            qb.where('sharedVaultAssociation.sharedVaultUuid IN (:...sharedVaultUuids)', {
              sharedVaultUuids: query.includeSharedVaultUuids,
            })

            if (query.userUuid) {
              qb.orWhere('item.user_uuid = :userUuid', { userUuid: query.userUuid })
            }
          }),
        )
    } else if (query.exclusiveSharedVaultUuids !== undefined && query.exclusiveSharedVaultUuids.length > 0) {
      queryBuilder
        .innerJoin(
          TypeORMSharedVaultAssociation,
          'sharedVaultAssociation',
          'sharedVaultAssociation.itemUuid = item.uuid',
        )
        .where('sharedVaultAssociation.sharedVaultUuid IN (:...sharedVaultUuids)', {
          sharedVaultUuids: query.exclusiveSharedVaultUuids,
        })
    } else if (query.userUuid !== undefined) {
      queryBuilder.where('item.user_uuid = :userUuid', { userUuid: query.userUuid })
    }

    if (query.selectString !== undefined) {
      queryBuilder.select(query.selectString)
    }
    if (query.uuids && query.uuids.length > 0) {
      queryBuilder.andWhere('item.uuid IN (:...uuids)', { uuids: query.uuids })
    }
    if (query.deleted !== undefined) {
      queryBuilder.andWhere('item.deleted = :deleted', { deleted: query.deleted })
    }
    if (query.contentType) {
      if (Array.isArray(query.contentType)) {
        queryBuilder.andWhere('item.content_type IN (:...contentTypes)', { contentTypes: query.contentType })
      } else {
        queryBuilder.andWhere('item.content_type = :contentType', { contentType: query.contentType })
      }
    }
    if (query.lastSyncTime && query.syncTimeComparison) {
      queryBuilder.andWhere(`item.updated_at_timestamp ${query.syncTimeComparison} :lastSyncTime`, {
        lastSyncTime: query.lastSyncTime,
      })
    }
    if (query.createdBetween !== undefined) {
      queryBuilder.andWhere('item.created_at >= :createdAfter AND item.created_at <= :createdBefore', {
        createdAfter: query.createdBetween[0].toISOString(),
        createdBefore: query.createdBetween[1].toISOString(),
      })
    }
    if (query.offset !== undefined) {
      queryBuilder.skip(query.offset)
    }
    if (query.limit !== undefined) {
      queryBuilder.take(query.limit)
    }

    return queryBuilder
  }

  private async decorateItemWithAssociations(item: Item): Promise<void> {
    await Promise.all([
      this.decorateItemWithKeySystemAssociation(item),
      this.decorateItemWithSharedVaultAssociation(item),
    ])
  }

  private async decorateItemWithKeySystemAssociation(item: Item): Promise<void> {
    const keySystemAssociation = await this.keySystemAssociationRepository.findByItemUuid(item.uuid)
    if (keySystemAssociation) {
      item.props.keySystemAssociation = keySystemAssociation
    }
  }

  private async decorateItemWithSharedVaultAssociation(item: Item): Promise<void> {
    const sharedVaultAssociation = await this.sharedVaultAssociationRepository.findByItemUuid(item.uuid)
    if (sharedVaultAssociation) {
      item.props.sharedVaultAssociation = sharedVaultAssociation
    }
  }

  private async persistAssociationChanges(item: Item): Promise<void> {
    for (const change of item.getChanges()) {
      if (change.props.changeData instanceof SharedVaultAssociation) {
        if ([Change.TYPES.Add, Change.TYPES.Modify].includes(change.props.changeType)) {
          await this.sharedVaultAssociationRepository.save(change.props.changeData)
        }
        if (change.props.changeType === Change.TYPES.Remove) {
          await this.sharedVaultAssociationRepository.remove(change.props.changeData)
        }
      }
      if (change.props.changeData instanceof KeySystemAssociation) {
        if ([Change.TYPES.Add, Change.TYPES.Modify].includes(change.props.changeType)) {
          await this.keySystemAssociationRepository.save(change.props.changeData)
        }
        if (change.props.changeType === Change.TYPES.Remove) {
          await this.keySystemAssociationRepository.remove(change.props.changeData)
        }
      }
    }

    item.flushChanges()
  }
}

import { Repository, SelectQueryBuilder } from 'typeorm'
import { MapperInterface } from '@standardnotes/domain-core'
import { Logger } from 'winston'

import { Item } from '../../Domain/Item/Item'
import { SQLLegacyItem } from './SQLLegacyItem'
import { SQLLegacyItemRepository } from './SQLLegacyItemRepository'
import { ItemQuery } from '../../Domain/Item/ItemQuery'

export class SQLItemRepository extends SQLLegacyItemRepository {
  constructor(
    protected override ormRepository: Repository<SQLLegacyItem>,
    protected override mapper: MapperInterface<Item, SQLLegacyItem>,
    protected override logger: Logger,
  ) {
    super(ormRepository, mapper, logger)
  }

  protected override createFindAllQueryBuilder(query: ItemQuery): SelectQueryBuilder<SQLLegacyItem> {
    const queryBuilder = this.ormRepository.createQueryBuilder('item')

    if (query.sortBy !== undefined && query.sortOrder !== undefined) {
      queryBuilder.orderBy(`item.${query.sortBy}`, query.sortOrder)
    }

    if (query.includeSharedVaultUuids !== undefined && query.includeSharedVaultUuids.length > 0) {
      if (query.userUuid) {
        queryBuilder.where('(item.user_uuid = :userUuid OR item.shared_vault_uuid IN (:...includeSharedVaultUuids))', {
          userUuid: query.userUuid,
          includeSharedVaultUuids: query.includeSharedVaultUuids,
        })
      } else {
        queryBuilder.where('item.shared_vault_uuid IN (:...includeSharedVaultUuids)', {
          includeSharedVaultUuids: query.includeSharedVaultUuids,
        })
      }
    } else if (query.exclusiveSharedVaultUuids !== undefined && query.exclusiveSharedVaultUuids.length > 0) {
      queryBuilder.where('item.shared_vault_uuid IN (:...exclusiveSharedVaultUuids)', {
        exclusiveSharedVaultUuids: query.exclusiveSharedVaultUuids,
      })
    } else if (query.userUuid !== undefined) {
      queryBuilder.where('item.user_uuid = :userUuid', { userUuid: query.userUuid })
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
}

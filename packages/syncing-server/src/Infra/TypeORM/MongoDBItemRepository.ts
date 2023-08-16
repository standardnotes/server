import { MapperInterface, Uuid } from '@standardnotes/domain-core'
import { FilterOperators, FindManyOptions, MongoRepository } from 'typeorm'
import { Logger } from 'winston'
import { BSON } from 'mongodb'

import { ExtendedIntegrityPayload } from '../../Domain/Item/ExtendedIntegrityPayload'
import { Item } from '../../Domain/Item/Item'
import { ItemQuery } from '../../Domain/Item/ItemQuery'
import { ItemRepositoryInterface } from '../../Domain/Item/ItemRepositoryInterface'
import { MongoDBItem } from './MongoDBItem'

export class MongoDBItemRepository implements ItemRepositoryInterface {
  constructor(
    private mongoRepository: MongoRepository<MongoDBItem>,
    private mapper: MapperInterface<Item, MongoDBItem>,
    private logger: Logger,
  ) {}

  async deleteByUserUuid(userUuid: string): Promise<void> {
    await this.mongoRepository.deleteMany({ where: { userUuid } })
  }

  async findAll(query: ItemQuery): Promise<Item[]> {
    const options = this.createFindOptions(query)
    const persistence = await this.mongoRepository.find(options)

    const domainItems: Item[] = []
    for (const persistencItem of persistence) {
      try {
        domainItems.push(this.mapper.toDomain(persistencItem))
      } catch (error) {
        this.logger.error(
          `Failed to map item ${persistencItem._id.toHexString()} to domain: ${(error as Error).message}`,
        )
      }
    }

    return domainItems
  }

  async countAll(query: ItemQuery): Promise<number> {
    return this.mongoRepository.count(this.createFindOptions(query))
  }

  async findContentSizeForComputingTransferLimit(
    query: ItemQuery,
  ): Promise<{ uuid: string; contentSize: number | null }[]> {
    const options = this.createFindOptions(query)
    const rawItems = await this.mongoRepository.find({
      select: ['uuid', 'contentSize'],
      ...options,
    })

    const items = rawItems.map((item) => {
      return {
        uuid: item._id.toHexString(),
        contentSize: item.contentSize,
      }
    })

    return items
  }

  async findDatesForComputingIntegrityHash(userUuid: string): Promise<{ updated_at_timestamp: number }[]> {
    const rawItems = await this.mongoRepository.find({
      select: ['updatedAtTimestamp'],
      where: {
        $and: [{ userUuid: { $eq: userUuid } }, { deleted: { $eq: false } }],
      },
    })

    const items = rawItems.map((item) => {
      return {
        updated_at_timestamp: item.updatedAtTimestamp,
      }
    })

    return items.sort((itemA, itemB) => itemB.updated_at_timestamp - itemA.updated_at_timestamp)
  }

  async findItemsForComputingIntegrityPayloads(userUuid: string): Promise<ExtendedIntegrityPayload[]> {
    const items = await this.mongoRepository.find({
      select: ['uuid', 'updatedAtTimestamp', 'contentType', 'userUuid', 'deleted'],
      where: {
        $and: [{ userUuid: { $eq: userUuid } }, { deleted: { $eq: false } }],
      },
    })

    const integrityPayloads = items.map((item) => {
      return {
        uuid: item._id.toHexString(),
        updated_at_timestamp: item.updatedAtTimestamp,
        content_type: item.contentType,
        user_uuid: item.userUuid,
        deleted: item.deleted,
      }
    })

    return integrityPayloads.sort((itemA, itemB) => itemB.updated_at_timestamp - itemA.updated_at_timestamp)
  }

  async findByUuidAndUserUuid(uuid: string, userUuid: string): Promise<Item | null> {
    const persistence = await this.mongoRepository.findOne({
      where: {
        $and: [{ _id: { $eq: BSON.UUID.createFromHexString(uuid) } }, { userUuid: { $eq: userUuid } }],
      },
    })

    if (persistence === null) {
      return null
    }

    return this.mapper.toDomain(persistence)
  }

  async findByUuid(uuid: Uuid): Promise<Item | null> {
    const persistence = await this.mongoRepository.findOne({
      where: { _id: { $eq: BSON.UUID.createFromHexString(uuid.value) } },
    })

    if (persistence === null) {
      return null
    }

    return this.mapper.toDomain(persistence)
  }

  async remove(item: Item): Promise<void> {
    await this.mongoRepository.deleteOne({ where: { _id: { $eq: BSON.UUID.createFromHexString(item.uuid.value) } } })
  }

  async save(item: Item): Promise<void> {
    const persistence = this.mapper.toProjection(item)

    const { _id, ...rest } = persistence

    await this.mongoRepository.updateOne(
      { _id: { $eq: _id } },
      {
        $set: rest,
      },
      { upsert: true },
    )
  }

  async markItemsAsDeleted(itemUuids: string[], updatedAtTimestamp: number): Promise<void> {
    await this.mongoRepository.updateMany(
      { where: { _id: { $in: itemUuids.map((uuid) => BSON.UUID.createFromHexString(uuid)) } } },
      { deleted: true, content: null, encItemKey: null, authHash: null, updatedAtTimestamp },
    )
  }

  async updateContentSize(itemUuid: string, contentSize: number): Promise<void> {
    await this.mongoRepository.updateOne(
      { where: { _id: { $eq: BSON.UUID.createFromHexString(itemUuid) } } },
      { contentSize },
    )
  }

  private createFindOptions(
    query: ItemQuery,
  ): FindManyOptions<MongoDBItem> | Partial<MongoDBItem> | FilterOperators<MongoDBItem> {
    const options: FindManyOptions<MongoDBItem> | Partial<MongoDBItem> | FilterOperators<MongoDBItem> = {
      order: undefined,
      where: undefined,
    }
    if (query.sortBy !== undefined && query.sortOrder !== undefined) {
      options.order = { [query.sortBy]: query.sortOrder }
    }

    if (query.userUuid !== undefined) {
      options.where = { ...options.where, userUuid: { $eq: query.userUuid } }
    }

    if (query.uuids && query.uuids.length > 0) {
      options.where = {
        ...options.where,
        _id: { $in: query.uuids.map((uuid) => BSON.UUID.createFromHexString(uuid)) },
      }
    }
    if (query.deleted !== undefined) {
      options.where = { ...options.where, deleted: { $eq: query.deleted } }
    }
    if (query.contentType) {
      if (Array.isArray(query.contentType)) {
        options.where = { ...options.where, contentType: { $in: query.contentType } }
      } else {
        options.where = { ...options.where, contentType: { $eq: query.contentType } }
      }
    }
    if (query.lastSyncTime && query.syncTimeComparison) {
      const mongoComparisonOperator = query.syncTimeComparison === '>' ? '$gt' : '$gte'
      options.where = {
        ...options.where,
        updatedAtTimestamp: { [mongoComparisonOperator]: query.lastSyncTime },
      }
    }
    if (query.createdBetween !== undefined) {
      options.where = {
        ...options.where,
        createdAt: {
          $gte: query.createdBetween[0].toISOString(),
          $lte: query.createdBetween[1].toISOString(),
        },
      }
    }

    if (query.offset !== undefined) {
      options.skip = query.offset
    }
    if (query.limit !== undefined) {
      options.take = query.limit
    }

    return options
  }
}

import { MapperInterface, Uuid } from '@standardnotes/domain-core'
import { ReadStream } from 'fs'
import { ExtendedIntegrityPayload } from '../../Domain/Item/ExtendedIntegrityPayload'
import { Item } from '../../Domain/Item/Item'
import { ItemQuery } from '../../Domain/Item/ItemQuery'
import { ItemRepositoryInterface } from '../../Domain/Item/ItemRepositoryInterface'
import { FilterOperators, FindOptionsWhere, MongoRepository } from 'typeorm'
import { MongoDBItem } from './MongoDBItem'
import { TypeORMItem } from './TypeORMItem'

export class MongoDBItemRepository implements ItemRepositoryInterface {
  constructor(
    private mongoRepository: MongoRepository<MongoDBItem>,
    private mapper: MapperInterface<Item, TypeORMItem>,
  ) {}

  async deleteByUserUuid(userUuid: string): Promise<void> {
    await this.mongoRepository.deleteMany({ where: { userUuid } })
  }

  findAll(query: ItemQuery): Promise<Item[]> {
    throw new Error('Method not implemented.')
  }
  findAllRaw<T>(query: ItemQuery): Promise<T[]> {
    throw new Error('Method not implemented.')
  }
  streamAll(query: ItemQuery): Promise<ReadStream> {
    throw new Error('Method not implemented.')
  }
  countAll(query: ItemQuery): Promise<number> {
    throw new Error('Method not implemented.')
  }

  async findContentSizeForComputingTransferLimit(
    query: ItemQuery,
  ): Promise<{ uuid: string; contentSize: number | null }[]> {
    const rawItems = await this.mongoRepository.find({
      select: ['uuid', 'contentSize'],
      // where: this.createFindAllQueryBuilder(query),
      where: {
        $and: [{ uuid: { $in: query.uuids } }, { deleted: { $eq: false } }],
      },
    })

    const items = rawItems.map((item) => {
      return {
        uuid: item.uuid,
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
        uuid: item.uuid,
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
        $and: [{ uuid: { $eq: uuid } }, { userUuid: { $eq: userUuid } }],
      },
    })

    if (persistence === null) {
      return null
    }

    return this.mapper.toDomain(persistence)
  }

  async findByUuid(uuid: Uuid): Promise<Item | null> {
    const persistence = await this.mongoRepository.findOne({ where: { uuid: { $eq: uuid } } })

    if (persistence === null) {
      return null
    }

    return this.mapper.toDomain(persistence)
  }

  async remove(item: Item): Promise<void> {
    await this.mongoRepository.deleteOne({ where: { uuid: { $eq: item.uuid } } })
  }

  async save(item: Item): Promise<void> {
    const persistence = this.mapper.toProjection(item)

    await this.mongoRepository.save(persistence)
  }

  async markItemsAsDeleted(itemUuids: string[], updatedAtTimestamp: number): Promise<void> {
    await this.mongoRepository.updateMany(
      { where: { uuid: { $in: itemUuids } } },
      { deleted: true, content: null, encItemKey: null, authHash: null, updatedAtTimestamp },
    )
  }

  async updateContentSize(itemUuid: string, contentSize: number): Promise<void> {
    await this.mongoRepository.updateOne({ where: { uuid: { $eq: itemUuid } } }, { contentSize })
  }

  private createFindAllQueryBuilder(
    query: ItemQuery,
  ): FindOptionsWhere<MongoDBItem>[] | FindOptionsWhere<MongoDBItem> | FilterOperators<MongoDBItem> {
    let options: FindOptionsWhere<MongoDBItem>[] | FindOptionsWhere<MongoDBItem> | FilterOperators<MongoDBItem>
    if (query.uuids && query.uuids.length > 0) {
      // queryBuilder.andWhere('item.uuid IN (:...uuids)', { uuids: query.uuids })
      options = {
        $and: [{ uuid: { $in: query.uuids } }, { deleted: { $eq: false } }],
      }
    }

    return options
  }
}

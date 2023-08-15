import { MapperInterface } from '@standardnotes/domain-core'

import { MongoDBItem } from '../../../Infra/TypeORM/MongoDBItem'
import { ItemPersistenceMapper } from '../ItemPersistenceMapper'
import { Item } from '../../../Domain/Item/Item'

export class MongoDBItemPersistenceMapper extends ItemPersistenceMapper implements MapperInterface<Item, MongoDBItem> {
  override toDomain(projection: MongoDBItem): Item {
    return super.toDomain(projection)
  }

  override toProjection(domain: Item): MongoDBItem {
    return super.toProjection(domain)
  }
}

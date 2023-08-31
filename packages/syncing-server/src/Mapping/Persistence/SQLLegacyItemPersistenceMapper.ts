import { Timestamps, MapperInterface, UniqueEntityId, Uuid, ContentType, Dates } from '@standardnotes/domain-core'

import { Item } from '../../Domain/Item/Item'

import { SQLLegacyItem } from '../../Infra/TypeORM/SQLLegacyItem'

export class SQLLegacyItemPersistenceMapper implements MapperInterface<Item, SQLLegacyItem> {
  toDomain(projection: SQLLegacyItem): Item {
    const uuidOrError = Uuid.create(projection.uuid)
    if (uuidOrError.isFailed()) {
      throw new Error(`Failed to create item from projection: ${uuidOrError.getError()}`)
    }
    const uuid = uuidOrError.getValue()

    let duplicateOf = null
    if (projection.duplicateOf) {
      const duplicateOfOrError = Uuid.create(projection.duplicateOf)
      if (duplicateOfOrError.isFailed()) {
        throw new Error(`Failed to create item from projection: ${duplicateOfOrError.getError()}`)
      }
      duplicateOf = duplicateOfOrError.getValue()
    }

    const contentTypeOrError = ContentType.create(projection.contentType)
    if (contentTypeOrError.isFailed()) {
      throw new Error(`Failed to create item from projection: ${contentTypeOrError.getError()}`)
    }
    const contentType = contentTypeOrError.getValue()

    const userUuidOrError = Uuid.create(projection.userUuid)
    if (userUuidOrError.isFailed()) {
      throw new Error(`Failed to create item from projection: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const datesOrError = Dates.create(projection.createdAt, projection.updatedAt)
    if (datesOrError.isFailed()) {
      throw new Error(`Failed to create item from projection: ${datesOrError.getError()}`)
    }
    const dates = datesOrError.getValue()

    const timestampsOrError = Timestamps.create(projection.createdAtTimestamp, projection.updatedAtTimestamp)
    if (timestampsOrError.isFailed()) {
      throw new Error(`Failed to create item from projection: ${timestampsOrError.getError()}`)
    }
    const timestamps = timestampsOrError.getValue()

    let updatedWithSession = null
    if (projection.updatedWithSession) {
      const updatedWithSessionOrError = Uuid.create(projection.updatedWithSession)
      if (updatedWithSessionOrError.isFailed()) {
        throw new Error(`Failed to create item from projection: ${updatedWithSessionOrError.getError()}`)
      }
      updatedWithSession = updatedWithSessionOrError.getValue()
    }

    const itemOrError = Item.create(
      {
        duplicateOf,
        itemsKeyId: projection.itemsKeyId,
        content: projection.content,
        contentType,
        contentSize: projection.contentSize ?? undefined,
        encItemKey: projection.encItemKey,
        authHash: projection.authHash,
        userUuid,
        deleted: !!projection.deleted,
        dates,
        timestamps,
        updatedWithSession,
      },
      new UniqueEntityId(uuid.value),
    )
    if (itemOrError.isFailed()) {
      throw new Error(`Failed to create item from projection: ${itemOrError.getError()}`)
    }

    return itemOrError.getValue()
  }

  toProjection(domain: Item): SQLLegacyItem {
    const typeorm = new SQLLegacyItem()

    typeorm.uuid = domain.id.toString()
    typeorm.duplicateOf = domain.props.duplicateOf ? domain.props.duplicateOf.value : null
    typeorm.itemsKeyId = domain.props.itemsKeyId
    typeorm.content = domain.props.content
    typeorm.contentType = domain.props.contentType.value
    typeorm.contentSize = domain.props.contentSize ?? null
    typeorm.encItemKey = domain.props.encItemKey
    typeorm.authHash = domain.props.authHash
    typeorm.userUuid = domain.props.userUuid.value
    typeorm.deleted = !!domain.props.deleted
    typeorm.createdAt = domain.props.dates.createdAt
    typeorm.updatedAt = domain.props.dates.updatedAt
    typeorm.createdAtTimestamp = domain.props.timestamps.createdAt
    typeorm.updatedAtTimestamp = domain.props.timestamps.updatedAt
    typeorm.updatedWithSession = domain.props.updatedWithSession ? domain.props.updatedWithSession.value : null

    return typeorm
  }
}

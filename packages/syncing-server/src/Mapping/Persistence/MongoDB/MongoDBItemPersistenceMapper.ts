import { ContentType, Dates, MapperInterface, Timestamps, UniqueEntityId, Uuid } from '@standardnotes/domain-core'
import { BSON } from 'mongodb'

import { MongoDBItem } from '../../../Infra/TypeORM/MongoDBItem'
import { Item } from '../../../Domain/Item/Item'
import { SharedVaultAssociation } from '../../../Domain/SharedVault/SharedVaultAssociation'
import { KeySystemAssociation } from '../../../Domain/KeySystem/KeySystemAssociation'

export class MongoDBItemPersistenceMapper implements MapperInterface<Item, MongoDBItem> {
  toDomain(projection: MongoDBItem): Item {
    const uuidOrError = Uuid.create(projection._id.toHexString())
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

    let sharedVaultAssociation: SharedVaultAssociation | undefined = undefined
    if (projection.sharedVaultUuid && projection.lastEditedBy) {
      const sharedVaultUuidOrError = Uuid.create(projection.sharedVaultUuid)
      if (sharedVaultUuidOrError.isFailed()) {
        throw new Error(`Failed to create item from projection: ${sharedVaultUuidOrError.getError()}`)
      }
      const sharedVaultUuid = sharedVaultUuidOrError.getValue()

      const lastEditedByOrError = Uuid.create(projection.lastEditedBy)
      if (lastEditedByOrError.isFailed()) {
        throw new Error(`Failed to create item from projection: ${lastEditedByOrError.getError()}`)
      }
      const lastEditedBy = lastEditedByOrError.getValue()

      const sharedVaultAssociationOrError = SharedVaultAssociation.create({
        sharedVaultUuid,
        lastEditedBy,
      })
      if (sharedVaultAssociationOrError.isFailed()) {
        throw new Error(`Failed to create item from projection: ${sharedVaultAssociationOrError.getError()}`)
      }
      sharedVaultAssociation = sharedVaultAssociationOrError.getValue()
    }

    let keySystemAssociation: KeySystemAssociation | undefined = undefined
    if (projection.keySystemIdentifier) {
      const keySystemAssociationOrError = KeySystemAssociation.create(projection.keySystemIdentifier)
      if (keySystemAssociationOrError.isFailed()) {
        throw new Error(`Failed to create item from projection: ${keySystemAssociationOrError.getError()}`)
      }
      keySystemAssociation = keySystemAssociationOrError.getValue()
    }

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
        deleted: projection.deleted,
        dates,
        timestamps,
        updatedWithSession,
        sharedVaultAssociation,
        keySystemAssociation,
      },
      new UniqueEntityId(uuid.value),
    )
    if (itemOrError.isFailed()) {
      throw new Error(`Failed to create item from projection: ${itemOrError.getError()}`)
    }

    return itemOrError.getValue()
  }

  toProjection(domain: Item): MongoDBItem {
    const mongoDbItem = new MongoDBItem()

    mongoDbItem._id = BSON.UUID.createFromHexString(domain.uuid.value)
    mongoDbItem.duplicateOf = domain.props.duplicateOf ? domain.props.duplicateOf.value : null
    mongoDbItem.itemsKeyId = domain.props.itemsKeyId
    mongoDbItem.content = domain.props.content
    mongoDbItem.contentType = domain.props.contentType.value
    mongoDbItem.contentSize = domain.props.contentSize ?? null
    mongoDbItem.encItemKey = domain.props.encItemKey
    mongoDbItem.authHash = domain.props.authHash
    mongoDbItem.userUuid = domain.props.userUuid.value
    mongoDbItem.deleted = domain.props.deleted
    mongoDbItem.createdAt = domain.props.dates.createdAt
    mongoDbItem.updatedAt = domain.props.dates.updatedAt
    mongoDbItem.createdAtTimestamp = domain.props.timestamps.createdAt
    mongoDbItem.updatedAtTimestamp = domain.props.timestamps.updatedAt
    mongoDbItem.updatedWithSession = domain.props.updatedWithSession ? domain.props.updatedWithSession.value : null
    mongoDbItem.lastEditedBy = domain.props.sharedVaultAssociation
      ? domain.props.sharedVaultAssociation.props.lastEditedBy.value
      : null
    mongoDbItem.sharedVaultUuid = domain.props.sharedVaultAssociation
      ? domain.props.sharedVaultAssociation.props.sharedVaultUuid.value
      : null
    mongoDbItem.keySystemIdentifier = domain.props.keySystemAssociation
      ? domain.props.keySystemAssociation.props.keySystemIdentifier
      : null

    return mongoDbItem
  }
}

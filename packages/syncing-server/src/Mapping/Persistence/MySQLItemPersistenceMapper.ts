import { Timestamps, MapperInterface, UniqueEntityId, Uuid, ContentType, Dates } from '@standardnotes/domain-core'

import { Item } from '../../Domain/Item/Item'

import { MySQLItem } from '../../Infra/TypeORM/MySQLItem'
import { KeySystemAssociation } from '../../Domain/KeySystem/KeySystemAssociation'
import { SharedVaultAssociation } from '../../Domain/SharedVault/SharedVaultAssociation'

export class MySQLItemPersistenceMapper implements MapperInterface<Item, MySQLItem> {
  toDomain(projection: MySQLItem): Item {
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

  toProjection(domain: Item): MySQLItem {
    const typeorm = new MySQLItem()

    typeorm.uuid = domain.id.toString()
    typeorm.duplicateOf = domain.props.duplicateOf ? domain.props.duplicateOf.value : null
    typeorm.itemsKeyId = domain.props.itemsKeyId
    typeorm.content = domain.props.content
    typeorm.contentType = domain.props.contentType.value
    typeorm.contentSize = domain.props.contentSize ?? null
    typeorm.encItemKey = domain.props.encItemKey
    typeorm.authHash = domain.props.authHash
    typeorm.userUuid = domain.props.userUuid.value
    typeorm.deleted = domain.props.deleted
    typeorm.createdAt = domain.props.dates.createdAt
    typeorm.updatedAt = domain.props.dates.updatedAt
    typeorm.createdAtTimestamp = domain.props.timestamps.createdAt
    typeorm.updatedAtTimestamp = domain.props.timestamps.updatedAt
    typeorm.updatedWithSession = domain.props.updatedWithSession ? domain.props.updatedWithSession.value : null
    typeorm.lastEditedBy = domain.props.sharedVaultAssociation
      ? domain.props.sharedVaultAssociation.props.lastEditedBy.value
      : null
    typeorm.sharedVaultUuid = domain.props.sharedVaultAssociation
      ? domain.props.sharedVaultAssociation.props.sharedVaultUuid.value
      : null
    typeorm.keySystemIdentifier = domain.props.keySystemAssociation
      ? domain.props.keySystemAssociation.props.keySystemIdentifier
      : null

    return typeorm
  }
}

import { MapperInterface, Dates, UniqueEntityId, Uuid, ContentType } from '@standardnotes/domain-core'
import { BSON } from 'mongodb'

import { MongoDBRevision } from '../../../Infra/TypeORM/MongoDB/MongoDBRevision'
import { Revision } from '../../../Domain/Revision/Revision'
import { SharedVaultAssociation } from '../../../Domain/SharedVault/SharedVaultAssociation'
import { KeySystemAssociation } from '../../../Domain/KeySystem/KeySystemAssociation'

export class MongoDBRevisionPersistenceMapper implements MapperInterface<Revision, MongoDBRevision> {
  toDomain(projection: MongoDBRevision): Revision {
    const contentTypeOrError = ContentType.create(projection.contentType)
    if (contentTypeOrError.isFailed()) {
      throw new Error(`Could not map typeorm revision to domain revision: ${contentTypeOrError.getError()}`)
    }
    const contentType = contentTypeOrError.getValue()

    const datesOrError = Dates.create(projection.createdAt, projection.updatedAt)
    if (datesOrError.isFailed()) {
      throw new Error(`Could not map typeorm revision to domain revision: ${datesOrError.getError()}`)
    }
    const dates = datesOrError.getValue()

    const itemUuidOrError = Uuid.create(projection.itemUuid)
    if (itemUuidOrError.isFailed()) {
      throw new Error(`Could not map typeorm revision to domain revision: ${itemUuidOrError.getError()}`)
    }
    const itemUuid = itemUuidOrError.getValue()

    let userUuid = null
    if (projection.userUuid !== null) {
      const userUuidOrError = Uuid.create(projection.userUuid)
      if (userUuidOrError.isFailed()) {
        throw new Error(`Could not map typeorm revision to domain revision: ${userUuidOrError.getError()}`)
      }
      userUuid = userUuidOrError.getValue()
    }

    let sharedVaultAssociation: SharedVaultAssociation | undefined = undefined
    if (projection.sharedVaultUuid && projection.editedBy) {
      const sharedVaultUuidOrError = Uuid.create(projection.sharedVaultUuid)
      if (sharedVaultUuidOrError.isFailed()) {
        throw new Error(`Failed to create revision from projection: ${sharedVaultUuidOrError.getError()}`)
      }
      const sharedVaultUuid = sharedVaultUuidOrError.getValue()

      const lastEditedByOrError = Uuid.create(projection.editedBy)
      if (lastEditedByOrError.isFailed()) {
        throw new Error(`Failed to create revision from projection: ${lastEditedByOrError.getError()}`)
      }
      const lastEditedBy = lastEditedByOrError.getValue()

      const sharedVaultAssociationOrError = SharedVaultAssociation.create({
        sharedVaultUuid,
        editedBy: lastEditedBy,
      })
      if (sharedVaultAssociationOrError.isFailed()) {
        throw new Error(`Failed to create revision from projection: ${sharedVaultAssociationOrError.getError()}`)
      }
      sharedVaultAssociation = sharedVaultAssociationOrError.getValue()
    }

    let keySystemAssociation: KeySystemAssociation | undefined = undefined
    if (projection.keySystemIdentifier) {
      const keySystemAssociationOrError = KeySystemAssociation.create(projection.keySystemIdentifier)
      if (keySystemAssociationOrError.isFailed()) {
        throw new Error(`Failed to create revision from projection: ${keySystemAssociationOrError.getError()}`)
      }
      keySystemAssociation = keySystemAssociationOrError.getValue()
    }

    const revisionOrError = Revision.create(
      {
        authHash: projection.authHash,
        content: projection.content,
        contentType,
        creationDate: projection.creationDate,
        encItemKey: projection.encItemKey,
        itemsKeyId: projection.itemsKeyId,
        itemUuid,
        userUuid,
        dates,
        sharedVaultAssociation,
        keySystemAssociation,
      },
      new UniqueEntityId(projection._id.toHexString()),
    )
    if (revisionOrError.isFailed()) {
      throw new Error(`Could not map typeorm revision to domain revision: ${revisionOrError.getError()}`)
    }

    return revisionOrError.getValue()
  }

  toProjection(domain: Revision): MongoDBRevision {
    const mongoDBRevision = new MongoDBRevision()

    mongoDBRevision.authHash = domain.props.authHash
    mongoDBRevision.content = domain.props.content
    mongoDBRevision.contentType = domain.props.contentType.value
    mongoDBRevision.createdAt = domain.props.dates.createdAt
    mongoDBRevision.updatedAt = domain.props.dates.updatedAt
    mongoDBRevision.creationDate = domain.props.creationDate
    mongoDBRevision.encItemKey = domain.props.encItemKey
    mongoDBRevision.itemUuid = domain.props.itemUuid.value
    mongoDBRevision.itemsKeyId = domain.props.itemsKeyId
    mongoDBRevision.userUuid = domain.props.userUuid ? domain.props.userUuid.value : null
    mongoDBRevision.sharedVaultUuid = domain.props.sharedVaultAssociation
      ? domain.props.sharedVaultAssociation.props.sharedVaultUuid.value
      : null
    mongoDBRevision.editedBy = domain.props.sharedVaultAssociation
      ? domain.props.sharedVaultAssociation.props.editedBy.value
      : null
    mongoDBRevision.keySystemIdentifier = domain.props.keySystemAssociation
      ? domain.props.keySystemAssociation.props.keySystemIdentifier
      : null
    mongoDBRevision._id = BSON.UUID.createFromHexString(domain.id.toString())

    return mongoDBRevision
  }
}

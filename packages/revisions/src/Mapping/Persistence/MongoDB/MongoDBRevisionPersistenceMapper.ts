import { MapperInterface, Dates, UniqueEntityId, Uuid, ContentType } from '@standardnotes/domain-core'

import { MongoDBRevision } from '../../../Infra/TypeORM/MongoDB/MongoDBRevision'
import { Revision } from '../../../Domain/Revision/Revision'
import { BSON } from 'typeorm'

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
    mongoDBRevision._id = BSON.UUID.createFromHexString(domain.id.toString())

    return mongoDBRevision
  }
}

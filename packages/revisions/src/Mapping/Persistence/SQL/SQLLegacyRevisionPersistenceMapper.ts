import { MapperInterface, Dates, UniqueEntityId, Uuid, ContentType } from '@standardnotes/domain-core'

import { Revision } from '../../../Domain/Revision/Revision'
import { SQLLegacyRevision } from '../../../Infra/TypeORM/SQL/SQLLegacyRevision'

export class SQLLegacyRevisionPersistenceMapper implements MapperInterface<Revision, SQLLegacyRevision> {
  toDomain(projection: SQLLegacyRevision): Revision {
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
      new UniqueEntityId(projection.uuid),
    )
    if (revisionOrError.isFailed()) {
      throw new Error(`Could not map typeorm revision to domain revision: ${revisionOrError.getError()}`)
    }

    return revisionOrError.getValue()
  }

  toProjection(domain: Revision): SQLLegacyRevision {
    const sqlRevision = new SQLLegacyRevision()

    sqlRevision.authHash = domain.props.authHash
    sqlRevision.content = domain.props.content
    sqlRevision.contentType = domain.props.contentType.value
    sqlRevision.createdAt = domain.props.dates.createdAt
    sqlRevision.updatedAt = domain.props.dates.updatedAt
    sqlRevision.creationDate = domain.props.creationDate
    sqlRevision.encItemKey = domain.props.encItemKey
    sqlRevision.itemUuid = domain.props.itemUuid.value
    sqlRevision.itemsKeyId = domain.props.itemsKeyId
    sqlRevision.userUuid = domain.props.userUuid ? domain.props.userUuid.value : null
    sqlRevision.uuid = domain.id.toString()

    return sqlRevision
  }
}

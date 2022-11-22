import { MapperInterface, Timestamps, UniqueEntityId, Uuid } from '@standardnotes/domain-core'
import { ContentType } from '../Domain/Revision/ContentType'
import { Revision } from '../Domain/Revision/Revision'
import { TypeORMRevision } from '../Infra/TypeORM/TypeORMRevision'

export class RevisionPersistenceMapper implements MapperInterface<Revision, TypeORMRevision> {
  toDomain(projection: TypeORMRevision): Revision {
    const contentTypeOrError = ContentType.create(projection.contentType)
    if (contentTypeOrError.isFailed()) {
      throw new Error(`Could not map typeorm revision to domain revision: ${contentTypeOrError.getError()}`)
    }
    const contentType = contentTypeOrError.getValue()

    const timestampsOrError = Timestamps.create(projection.createdAt, projection.updatedAt)
    if (timestampsOrError.isFailed()) {
      throw new Error(`Could not map typeorm revision to domain revision: ${timestampsOrError.getError()}`)
    }
    const timestamps = timestampsOrError.getValue()

    const itemUuidOrError = Uuid.create(projection.itemUuid)
    if (itemUuidOrError.isFailed()) {
      throw new Error(`Could not map typeorm revision to domain revision: ${itemUuidOrError.getError()}`)
    }
    const itemUuid = itemUuidOrError.getValue()

    const userUuidOrError = Uuid.create(projection.userUuid)
    if (userUuidOrError.isFailed()) {
      throw new Error(`Could not map typeorm revision to domain revision: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

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
        timestamps,
      },
      new UniqueEntityId(projection.uuid),
    )
    if (revisionOrError.isFailed()) {
      throw new Error(`Could not map typeorm revision to domain revision: ${revisionOrError.getError()}`)
    }

    return revisionOrError.getValue()
  }

  toProjection(domain: Revision): TypeORMRevision {
    const typeormRevision = new TypeORMRevision()

    typeormRevision.authHash = domain.props.authHash
    typeormRevision.content = domain.props.content
    typeormRevision.contentType = domain.props.contentType.value
    typeormRevision.createdAt = domain.props.timestamps.createdAt
    typeormRevision.updatedAt = domain.props.timestamps.updatedAt
    typeormRevision.creationDate = domain.props.creationDate
    typeormRevision.encItemKey = domain.props.encItemKey
    typeormRevision.itemUuid = domain.props.itemUuid.value
    typeormRevision.itemsKeyId = domain.props.itemsKeyId
    typeormRevision.userUuid = domain.props.userUuid.value
    typeormRevision.uuid = domain.id.toString()

    return typeormRevision
  }
}

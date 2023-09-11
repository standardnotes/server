import { MapperInterface, Dates, UniqueEntityId, ContentType } from '@standardnotes/domain-core'

import { RevisionMetadata } from '../../../Domain/Revision/RevisionMetadata'
import { MongoDBRevision } from '../../../Infra/TypeORM/MongoDB/MongoDBRevision'

export class MongoDBRevisionMetadataPersistenceMapper implements MapperInterface<RevisionMetadata, MongoDBRevision> {
  toDomain(projection: MongoDBRevision): RevisionMetadata {
    const contentTypeOrError = ContentType.create(projection.contentType)
    if (contentTypeOrError.isFailed()) {
      throw new Error(`Could not create content type: ${contentTypeOrError.getError()}`)
    }
    const contentType = contentTypeOrError.getValue()

    const createdAt = projection.createdAt instanceof Date ? projection.createdAt : new Date(projection.createdAt)
    const updatedAt = projection.updatedAt instanceof Date ? projection.updatedAt : new Date(projection.updatedAt)

    const datesOrError = Dates.create(createdAt, updatedAt)
    if (datesOrError.isFailed()) {
      throw new Error(`Could not create dates: ${datesOrError.getError()}`)
    }
    const dates = datesOrError.getValue()

    const revisionMetadataOrError = RevisionMetadata.create(
      {
        contentType,
        dates,
        sharedVaultUuid: projection.sharedVaultUuid,
      },
      new UniqueEntityId(projection._id.toHexString()),
    )

    if (revisionMetadataOrError.isFailed()) {
      throw new Error(`Could not create revision metdata: ${revisionMetadataOrError.getError()}`)
    }

    return revisionMetadataOrError.getValue()
  }

  toProjection(_domain: RevisionMetadata): MongoDBRevision {
    throw new Error('Method not implemented.')
  }
}

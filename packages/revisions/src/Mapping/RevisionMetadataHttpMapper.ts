import { MapperInterface } from '@standardnotes/domain-core'

import { RevisionMetadata } from '../Domain/Revision/RevisionMetadata'

export class RevisionMetadataHttpMapper
  implements
    MapperInterface<
      RevisionMetadata,
      {
        uuid: string
        contentType: string
        createdAt: string
        updatedAt: string
      }
    >
{
  toDomain(_projection: { uuid: string; contentType: string; createdAt: string; updatedAt: string }): RevisionMetadata {
    throw new Error('Method not implemented.')
  }

  toProjection(domain: RevisionMetadata): {
    uuid: string
    contentType: string
    createdAt: string
    updatedAt: string
  } {
    return {
      uuid: domain.id.toString(),
      contentType: domain.props.contentType.value as string,
      createdAt: domain.props.dates.createdAt.toISOString(),
      updatedAt: domain.props.dates.updatedAt.toISOString(),
    }
  }
}

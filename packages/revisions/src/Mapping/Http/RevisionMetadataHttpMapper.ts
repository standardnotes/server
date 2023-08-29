import { MapperInterface, SyncUseCaseInterface } from '@standardnotes/domain-core'

import { RevisionMetadata } from '../../Domain/Revision/RevisionMetadata'

export class RevisionMetadataHttpMapper
  implements
    MapperInterface<
      RevisionMetadata,
      {
        uuid: string
        content_type: string
        created_at: string
        updated_at: string
        required_role: string
      }
    >
{
  constructor(private getRequiredRoleToViewRevision: SyncUseCaseInterface<string>) {}

  toDomain(_projection: {
    uuid: string
    content_type: string
    created_at: string
    updated_at: string
    required_role: string
  }): RevisionMetadata {
    throw new Error('Method not implemented.')
  }

  toProjection(domain: RevisionMetadata): {
    uuid: string
    content_type: string
    created_at: string
    updated_at: string
    required_role: string
  } {
    return {
      uuid: domain.id.toString(),
      content_type: domain.props.contentType.value as string,
      created_at: domain.props.dates.createdAt.toISOString(),
      updated_at: domain.props.dates.updatedAt.toISOString(),
      required_role: this.getRequiredRoleToViewRevision.execute({ createdAt: domain.props.dates.createdAt }).getValue(),
    }
  }
}

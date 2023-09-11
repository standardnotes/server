import { MapperInterface, SyncUseCaseInterface } from '@standardnotes/domain-core'

import { RevisionMetadata } from '../../Domain/Revision/RevisionMetadata'
import { RevisionMetadataHttpRepresentation } from './RevisionMetadataHttpRepresentation'

export class RevisionMetadataHttpMapper
  implements MapperInterface<RevisionMetadata, RevisionMetadataHttpRepresentation>
{
  constructor(private getRequiredRoleToViewRevision: SyncUseCaseInterface<string>) {}

  toDomain(_projection: RevisionMetadataHttpRepresentation): RevisionMetadata {
    throw new Error('Method not implemented.')
  }

  toProjection(domain: RevisionMetadata): RevisionMetadataHttpRepresentation {
    return {
      uuid: domain.id.toString(),
      item_uuid: domain.props.itemUuid.value,
      content_type: domain.props.contentType.value as string,
      created_at: domain.props.dates.createdAt.toISOString(),
      updated_at: domain.props.dates.updatedAt.toISOString(),
      required_role: this.getRequiredRoleToViewRevision.execute({ createdAt: domain.props.dates.createdAt }).getValue(),
      shared_vault_uuid: domain.props.sharedVaultUuid ? domain.props.sharedVaultUuid.value : null,
    }
  }
}

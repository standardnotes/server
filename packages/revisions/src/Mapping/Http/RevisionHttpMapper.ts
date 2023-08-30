import { MapperInterface } from '@standardnotes/domain-core'

import { Revision } from '../../Domain/Revision/Revision'
import { RevisionHttpRepresentation } from './RevisionHttpRepresentation'

export class RevisionHttpMapper implements MapperInterface<Revision, RevisionHttpRepresentation> {
  toDomain(_projection: RevisionHttpRepresentation): Revision {
    throw new Error('Method not implemented.')
  }

  toProjection(domain: Revision): RevisionHttpRepresentation {
    return {
      uuid: domain.id.toString(),
      item_uuid: domain.props.itemUuid.value,
      content: domain.props.content,
      content_type: domain.props.contentType.value as string,
      items_key_id: domain.props.itemsKeyId,
      enc_item_key: domain.props.encItemKey,
      auth_hash: domain.props.authHash,
      created_at: domain.props.dates.createdAt.toISOString(),
      updated_at: domain.props.dates.updatedAt.toISOString(),
    }
  }
}

import { MapperInterface } from '@standardnotes/domain-core'

import { Revision } from '../../Domain/Revision/Revision'

export class RevisionHttpMapper
  implements
    MapperInterface<
      Revision,
      {
        uuid: string
        item_uuid: string
        content: string | null
        content_type: string
        items_key_id: string | null
        enc_item_key: string | null
        auth_hash: string | null
        created_at: string
        updated_at: string
      }
    >
{
  toDomain(_projection: {
    uuid: string
    item_uuid: string
    content: string | null
    content_type: string
    items_key_id: string | null
    enc_item_key: string | null
    auth_hash: string | null
    created_at: string
    updated_at: string
  }): Revision {
    throw new Error('Method not implemented.')
  }

  toProjection(domain: Revision): {
    uuid: string
    item_uuid: string
    content: string | null
    content_type: string
    items_key_id: string | null
    enc_item_key: string | null
    auth_hash: string | null
    created_at: string
    updated_at: string
  } {
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

import { MapperInterface } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

import { Item } from '../../Domain/Item/Item'
import { ItemHttpRepresentation } from './ItemHttpRepresentation'

export class ItemHttpMapper implements MapperInterface<Item, ItemHttpRepresentation> {
  constructor(private timer: TimerInterface) {}

  toDomain(_projection: ItemHttpRepresentation): Item {
    throw new Error('Mapping from http representation to domain is not implemented.')
  }

  toProjection(domain: Item): ItemHttpRepresentation {
    return {
      uuid: domain.id.toString(),
      items_key_id: domain.props.itemsKeyId,
      duplicate_of: domain.props.duplicateOf ? domain.props.duplicateOf.value : null,
      enc_item_key: domain.props.encItemKey,
      content: domain.props.content,
      content_type: domain.props.contentType.value as string,
      auth_hash: domain.props.authHash,
      deleted: !!domain.props.deleted,
      created_at: this.timer.convertMicrosecondsToStringDate(domain.props.timestamps.createdAt),
      created_at_timestamp: domain.props.timestamps.createdAt,
      updated_at: this.timer.convertMicrosecondsToStringDate(domain.props.timestamps.updatedAt),
      updated_at_timestamp: domain.props.timestamps.updatedAt,
      updated_with_session: domain.props.updatedWithSession ? domain.props.updatedWithSession.value : null,
    }
  }
}

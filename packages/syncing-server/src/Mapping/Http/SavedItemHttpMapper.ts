import { MapperInterface } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

import { Item } from '../../Domain/Item/Item'
import { SavedItemHttpRepresentation } from './SavedItemHttpRepresentation'

export class SavedItemHttpMapper implements MapperInterface<Item, SavedItemHttpRepresentation> {
  constructor(private timer: TimerInterface) {}

  toDomain(_projection: SavedItemHttpRepresentation): Item {
    throw new Error('Mapping from http representation to domain is not implemented.')
  }

  toProjection(domain: Item): SavedItemHttpRepresentation {
    return {
      uuid: domain.id.toString(),
      duplicate_of: domain.props.duplicateOf ? domain.props.duplicateOf.value : null,
      content_type: domain.props.contentType.value as string,
      auth_hash: domain.props.authHash,
      deleted: !!domain.props.deleted,
      created_at: this.timer.convertMicrosecondsToStringDate(domain.props.timestamps.createdAt),
      created_at_timestamp: domain.props.timestamps.createdAt,
      updated_at: this.timer.convertMicrosecondsToStringDate(domain.props.timestamps.updatedAt),
      updated_at_timestamp: domain.props.timestamps.updatedAt,
    }
  }
}

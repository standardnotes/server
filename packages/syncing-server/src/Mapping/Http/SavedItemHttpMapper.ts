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
      key_system_identifier: domain.props.keySystemAssociation
        ? domain.props.keySystemAssociation.props.keySystemUuid.value
        : null,
      shared_vault_uuid: domain.props.sharedVaultAssociation
        ? domain.props.sharedVaultAssociation.props.sharedVaultUuid.value
        : null,
      user_uuid: domain.props.userUuid.value,
      last_edited_by_uuid: domain.props.sharedVaultAssociation
        ? domain.props.sharedVaultAssociation.props.lastEditedBy.value
        : null,
    }
  }
}

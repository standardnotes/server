import { TimerInterface } from '@standardnotes/time'

import { Item } from '../Domain/Item/Item'

import { ProjectorInterface } from './ProjectorInterface'
import { SavedItemProjection } from './SavedItemProjection'

export class SavedItemProjector implements ProjectorInterface<Item, SavedItemProjection> {
  constructor(private timer: TimerInterface) {}

  projectSimple(_item: Item): SavedItemProjection {
    throw Error('not implemented')
  }

  projectCustom(_projectionType: string, _item: Item): SavedItemProjection {
    throw Error('not implemented')
  }

  projectFull(item: Item): SavedItemProjection {
    return {
      uuid: item.uuid,
      duplicate_of: item.duplicateOf,
      content_type: item.contentType as string,
      auth_hash: item.authHash,
      deleted: !!item.deleted,
      created_at: this.timer.convertMicrosecondsToStringDate(item.createdAtTimestamp),
      created_at_timestamp: item.createdAtTimestamp,
      updated_at: this.timer.convertMicrosecondsToStringDate(item.updatedAtTimestamp),
      updated_at_timestamp: item.updatedAtTimestamp,
      vault_uuid: item.vaultUuid,
      last_edited_by_uuid: item.lastEditedByUuid,
    }
  }
}

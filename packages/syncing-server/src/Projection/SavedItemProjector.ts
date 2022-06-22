import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'
import TYPES from '../Bootstrap/Types'
import { ProjectorInterface } from './ProjectorInterface'

import { Item } from '../Domain/Item/Item'
import { SavedItemProjection } from './SavedItemProjection'

@injectable()
export class SavedItemProjector implements ProjectorInterface<Item, SavedItemProjection> {
  constructor(@inject(TYPES.Timer) private timer: TimerInterface) {}

  async projectSimple(_item: Item): Promise<SavedItemProjection> {
    throw Error('not implemented')
  }

  async projectCustom(_projectionType: string, _item: Item): Promise<SavedItemProjection> {
    throw Error('not implemented')
  }

  async projectFull(item: Item): Promise<SavedItemProjection> {
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
    }
  }
}

import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'
import TYPES from '../Bootstrap/Types'
import { ProjectorInterface } from './ProjectorInterface'

import { Item } from '../Domain/Item/Item'
import { ItemProjection } from './ItemProjection'

@injectable()
export class ItemProjector implements ProjectorInterface<Item, ItemProjection> {
  constructor(@inject(TYPES.Timer) private timer: TimerInterface) {}

  async projectSimple(_item: Item): Promise<ItemProjection> {
    throw Error('not implemented')
  }

  async projectCustom(_projectionType: string, _item: Item): Promise<ItemProjection> {
    throw Error('not implemented')
  }

  async projectFull(item: Item): Promise<ItemProjection> {
    return {
      uuid: item.uuid,
      items_key_id: item.itemsKeyId,
      duplicate_of: item.duplicateOf,
      enc_item_key: item.encItemKey,
      content: item.content,
      content_type: item.contentType as string,
      auth_hash: item.authHash,
      deleted: !!item.deleted,
      created_at: this.timer.convertMicrosecondsToStringDate(item.createdAtTimestamp),
      created_at_timestamp: item.createdAtTimestamp,
      updated_at: this.timer.convertMicrosecondsToStringDate(item.updatedAtTimestamp),
      updated_at_timestamp: item.updatedAtTimestamp,
      updated_with_session: item.updatedWithSession,
    }
  }
}

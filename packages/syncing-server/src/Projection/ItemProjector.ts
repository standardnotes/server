import { TimerInterface } from '@standardnotes/time'
import { ProjectorInterface } from './ProjectorInterface'

import { Item } from '../Domain/Item/Item'
import { ItemProjection } from './ItemProjection'
import { ItemProjectionWithUser } from './ItemProjectionWithUser'

export class ItemProjector implements ProjectorInterface<Item, ItemProjection> {
  constructor(private timer: TimerInterface) {}

  async projectSimple(_item: Item): Promise<ItemProjection> {
    throw Error('not implemented')
  }

  async projectCustom(_projectionType: string, item: Item): Promise<ItemProjectionWithUser> {
    const fullProjection = await this.projectFull(item)

    return {
      ...fullProjection,
      user_uuid: item.userUuid,
    }
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
      group_uuid: item.groupUuid,
    }
  }
}

import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { ItemProjection } from '../../Projection/ItemProjection'
import { ProjectorInterface } from '../../Projection/ProjectorInterface'
import { Item } from './Item'
import { ItemFactoryInterface } from './ItemFactoryInterface'
import { ItemHash } from './ItemHash'

@injectable()
export class ItemFactory implements ItemFactoryInterface {
  constructor(
    @inject(TYPES.Timer) private timer: TimerInterface,
    @inject(TYPES.ItemProjector) private itemProjector: ProjectorInterface<Item, ItemProjection>,
  ) {}

  createStub(dto: { userUuid: string; itemHash: ItemHash; sessionUuid: string | null }): Item {
    const item = this.create(dto)

    if (dto.itemHash.content === undefined) {
      item.content = null
    }

    if (dto.itemHash.updated_at_timestamp) {
      item.updatedAtTimestamp = dto.itemHash.updated_at_timestamp
      item.updatedAt = this.timer.convertMicrosecondsToDate(dto.itemHash.updated_at_timestamp)
    } else if (dto.itemHash.updated_at) {
      item.updatedAtTimestamp = this.timer.convertStringDateToMicroseconds(dto.itemHash.updated_at)
      item.updatedAt = this.timer.convertStringDateToDate(dto.itemHash.updated_at)
    }

    return item
  }

  create(dto: { userUuid: string; itemHash: ItemHash; sessionUuid: string | null }): Item {
    const newItem = new Item()
    newItem.uuid = dto.itemHash.uuid
    newItem.updatedWithSession = dto.sessionUuid
    newItem.contentSize = 0
    if (dto.itemHash.content) {
      newItem.content = dto.itemHash.content
    }
    newItem.userUuid = dto.userUuid
    if (dto.itemHash.content_type) {
      newItem.contentType = dto.itemHash.content_type
    }
    if (dto.itemHash.enc_item_key) {
      newItem.encItemKey = dto.itemHash.enc_item_key
    }
    if (dto.itemHash.items_key_id) {
      newItem.itemsKeyId = dto.itemHash.items_key_id
    }
    if (dto.itemHash.duplicate_of) {
      newItem.duplicateOf = dto.itemHash.duplicate_of
    }
    if (dto.itemHash.deleted !== undefined) {
      newItem.deleted = dto.itemHash.deleted
    }
    if (dto.itemHash.auth_hash) {
      newItem.authHash = dto.itemHash.auth_hash
    }

    const now = this.timer.getTimestampInMicroseconds()
    const nowDate = this.timer.convertMicrosecondsToDate(now)

    newItem.updatedAtTimestamp = now
    newItem.updatedAt = nowDate

    newItem.createdAtTimestamp = now
    newItem.createdAt = nowDate

    if (dto.itemHash.created_at_timestamp) {
      newItem.createdAtTimestamp = dto.itemHash.created_at_timestamp
      newItem.createdAt = this.timer.convertMicrosecondsToDate(dto.itemHash.created_at_timestamp)
    } else if (dto.itemHash.created_at) {
      newItem.createdAtTimestamp = this.timer.convertStringDateToMicroseconds(dto.itemHash.created_at)
      newItem.createdAt = this.timer.convertStringDateToDate(dto.itemHash.created_at)
    }

    newItem.contentSize = Buffer.byteLength(JSON.stringify(this.itemProjector.projectFull(newItem)))

    return newItem
  }
}

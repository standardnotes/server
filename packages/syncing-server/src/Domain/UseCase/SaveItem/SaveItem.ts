import { TimerInterface } from '@standardnotes/time'
import { Item } from '../../Item/Item'
import { ItemRepositoryInterface } from '../../Item/ItemRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'

export class SaveItem implements UseCaseInterface {
  constructor(private itemRepository: ItemRepositoryInterface, private timer: TimerInterface) {}

  async execute(dto: { item: Item }): Promise<{ savedItem: Item }> {
    const updatedAt = this.timer.getTimestampInMicroseconds()
    dto.item.updatedAtTimestamp = updatedAt
    dto.item.updatedAt = this.timer.convertMicrosecondsToDate(updatedAt)

    const savedItem = await this.itemRepository.save(dto.item)
    return { savedItem }
  }
}

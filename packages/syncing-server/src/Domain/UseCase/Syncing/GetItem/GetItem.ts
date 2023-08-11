import { Result, UseCaseInterface } from '@standardnotes/domain-core'

import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'
import { GetItemDTO } from './GetItemDTO'
import { Item } from '../../../Item/Item'

export class GetItem implements UseCaseInterface<Item> {
  constructor(private itemRepository: ItemRepositoryInterface) {}

  async execute(dto: GetItemDTO): Promise<Result<Item>> {
    const item = await this.itemRepository.findByUuidAndUserUuid(dto.itemUuid, dto.userUuid)

    if (item === null) {
      return Result.fail(`Could not find item with uuid ${dto.itemUuid}`)
    }

    return Result.ok(item)
  }
}

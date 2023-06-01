import { ItemRepositoryInterface } from '../../Item/ItemRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { GetItemResponse } from './GetItemResponse'
import { GetItemDTO } from './GetItemDTO'

export class GetItem implements UseCaseInterface {
  constructor(private itemRepository: ItemRepositoryInterface) {}

  async execute(dto: GetItemDTO): Promise<GetItemResponse> {
    const item =
      'userUuid' in dto
        ? await this.itemRepository.findByUuidAndUserUuid(dto.itemUuid, dto.userUuid)
        : await this.itemRepository.findByUuid(dto.itemUuid)

    if (item === null) {
      return {
        success: false,
        message: `Could not find item with uuid ${dto.itemUuid}`,
      }
    }

    return {
      success: true,
      item,
    }
  }
}

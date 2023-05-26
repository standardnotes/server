import { ItemRepositoryInterface } from '../../Item/ItemRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { GetGlobalItemDTO } from './GetGlobalItemDTO'
import { GetGlobalItemResponse } from './GetGlobalItemResponse'

export class GetGlobalItem implements UseCaseInterface {
  constructor(private itemRepository: ItemRepositoryInterface) {}

  async execute(dto: GetGlobalItemDTO): Promise<GetGlobalItemResponse> {
    const item = await this.itemRepository.findByUuid(dto.itemUuid)

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

import { inject, injectable } from 'inversify'
import TYPES from '../../../Bootstrap/Types'
import { ItemRepositoryInterface } from '../../Item/ItemRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { GetItemDTO } from './GetItemDTO'
import { GetItemResponse } from './GetItemResponse'

@injectable()
export class GetItem implements UseCaseInterface {
  constructor(@inject(TYPES.ItemRepository) private itemRepository: ItemRepositoryInterface) {}

  async execute(dto: GetItemDTO): Promise<GetItemResponse> {
    const item = await this.itemRepository.findByUuidAndUserUuid(dto.itemUuid, dto.userUuid)

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

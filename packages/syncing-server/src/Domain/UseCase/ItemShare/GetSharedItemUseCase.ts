import { ItemShare } from '../../ItemShare/Model/ItemShare'
import { Item } from '../../Item/Item'
import { ItemShareServiceInterface } from '../../ItemShare/Service/ItemShareServiceInterface'
import { UseCaseInterface } from '../UseCaseInterface'

export type GetSharedItemResponse =
  | {
      success: true
      item: Item
      itemShare: ItemShare
    }
  | {
      success: false
      message: string
    }

export class GetSharedItemUseCase implements UseCaseInterface {
  constructor(private itemShareService: ItemShareServiceInterface) {}

  async execute(dto: { shareToken: string }): Promise<GetSharedItemResponse> {
    const result = await this.itemShareService.getSharedItem(dto.shareToken)

    if (result === null) {
      return {
        success: false,
        message: `Could not get shared item with token ${dto.shareToken}`,
      }
    }

    return {
      success: true,
      item: result.item,
      itemShare: result.itemShare,
    }
  }
}

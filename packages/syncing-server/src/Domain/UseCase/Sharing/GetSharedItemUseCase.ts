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
      errorTag: string
    }

export class GetSharedItemUseCase implements UseCaseInterface {
  constructor(private itemShareService: ItemShareServiceInterface) {}

  async execute(dto: { shareToken: string }): Promise<GetSharedItemResponse> {
    const result = await this.itemShareService.getSharedItem(dto.shareToken)

    if ('error' in result) {
      return {
        success: false,
        message: `Could not get shared item with token ${dto.shareToken}`,
        errorTag: result.error.tag,
      }
    }

    return {
      success: true,
      item: result.item,
      itemShare: result.itemShare,
    }
  }
}

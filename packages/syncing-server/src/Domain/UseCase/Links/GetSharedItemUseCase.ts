import { ItemLink } from '../../ItemLink/Model/ItemLink'
import { Item } from '../../Item/Item'
import { ItemLinkServiceInterface } from '../../ItemLink/Service/ItemLinkServiceInterface'
import { UseCaseInterface } from '../UseCaseInterface'

export type GetSharedItemResponse =
  | {
      success: true
      item: Item
      itemShare: ItemLink
    }
  | {
      success: false
      message: string
      errorTag: string
    }

export class GetSharedItemUseCase implements UseCaseInterface {
  constructor(private itemShareService: ItemLinkServiceInterface) {}

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
      itemShare: result.itemLink,
    }
  }
}

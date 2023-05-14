import { ItemLink } from '../../ItemLink/Model/ItemLink'
import { ItemLinkServiceInterface } from '../../ItemLink/Service/ItemLinkServiceInterface'
import { ShareItemDTO } from '../../ItemLink/Service/LinkItemDTO'
import { UseCaseInterface } from '../UseCaseInterface'

export type ShareItemResponse =
  | {
      success: true
      itemShare: ItemLink
    }
  | {
      success: false
      message: string
    }

export class ShareItemUseCase implements UseCaseInterface {
  constructor(private itemShareService: ItemLinkServiceInterface) {}

  async execute(dto: ShareItemDTO): Promise<ShareItemResponse> {
    const result = await this.itemShareService.shareItem(dto)

    if (result === null) {
      return {
        success: false,
        message: `Could not share item with uuid ${dto.itemUuid}`,
      }
    }

    return {
      success: true,
      itemShare: result.itemShare,
    }
  }
}

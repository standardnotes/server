import { ItemShare } from '../../ItemShare/Model/ItemShare'
import { ItemShareServiceInterface } from '../../ItemShare/Service/ItemShareServiceInterface'
import { ShareItemDTO } from '../../ItemShare/Service/ShareItemDTO'
import { UseCaseInterface } from '../UseCaseInterface'

export type ShareItemResponse =
  | {
      success: true
      itemShare: ItemShare
    }
  | {
      success: false
      message: string
    }

export class ShareItemUseCase implements UseCaseInterface {
  constructor(private itemShareService: ItemShareServiceInterface) {}

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

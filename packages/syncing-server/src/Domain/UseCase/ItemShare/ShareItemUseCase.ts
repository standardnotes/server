import { ItemShare } from '../../ItemShare/ItemShare'
import { ItemShareServiceInterface, ShareItemDTO } from '../../ItemShare/ItemShareServiceInterface'
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

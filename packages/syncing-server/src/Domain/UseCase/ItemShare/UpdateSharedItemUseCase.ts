import { ItemShareServiceInterface } from '../../ItemShare/Service/ItemShareServiceInterface'
import { UpdateSharedItemDto } from '../../ItemShare/Service/UpdateSharedItemDto'
import { UseCaseInterface } from '../UseCaseInterface'

export type UpdateSharedItemResponse =
  | {
      success: true
    }
  | {
      success: false
      message: string
    }

export class UpdateSharedItemUseCase implements UseCaseInterface {
  constructor(private itemShareService: ItemShareServiceInterface) {}

  async execute(dto: UpdateSharedItemDto): Promise<UpdateSharedItemResponse> {
    const result = await this.itemShareService.updateSharedItem(dto)

    if (result === null) {
      return {
        success: false,
        message: `Could not update shared item with token ${dto.shareToken}`,
      }
    }

    return {
      success: true,
    }
  }
}

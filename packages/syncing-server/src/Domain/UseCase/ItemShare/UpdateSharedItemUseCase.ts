import { UpdateSharedItemDto } from './../../ItemShare/ItemShareServiceInterface'
import { ItemShareServiceInterface } from '../../ItemShare/ItemShareServiceInterface'
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

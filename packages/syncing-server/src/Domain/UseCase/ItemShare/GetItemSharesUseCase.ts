import { ItemShare } from '../../ItemShare/ItemShare'
import { ItemShareServiceInterface } from '../../ItemShare/ItemShareServiceInterface'
import { UseCaseInterface } from '../UseCaseInterface'

export type GetItemSharesResponse =
  | {
      success: true
      itemShares: ItemShare[]
    }
  | {
      success: false
      message: string
    }

export class GetItemSharesUseCase implements UseCaseInterface {
  constructor(private itemShareService: ItemShareServiceInterface) {}

  async execute(dto: { userUuid: string }): Promise<GetItemSharesResponse> {
    const result = await this.itemShareService.getUserItemShares(dto.userUuid)

    if (result === null) {
      return {
        success: false,
        message: `Could not get user item shares for user ${dto.userUuid}`,
      }
    }

    return {
      success: true,
      itemShares: result,
    }
  }
}

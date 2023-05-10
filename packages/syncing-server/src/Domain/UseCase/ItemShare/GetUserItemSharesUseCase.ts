import { ItemShare } from '../../ItemShare/ItemShare'
import { ItemShareServiceInterface } from '../../ItemShare/ItemShareServiceInterface'
import { UseCaseInterface } from '../UseCaseInterface'

export type GetUserItemSharesResponse =
  | {
      success: true
      itemShares: ItemShare[]
    }
  | {
      success: false
      message: string
    }

export class GetUserItemSharesUseCase implements UseCaseInterface {
  constructor(private itemShareService: ItemShareServiceInterface) {}

  async execute(dto: { userUuid: string }): Promise<GetUserItemSharesResponse> {
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

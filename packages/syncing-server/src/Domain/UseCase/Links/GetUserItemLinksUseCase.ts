import { ItemLink } from '../../ItemLink/Model/ItemLink'
import { ItemLinkServiceInterface } from '../../ItemLink/Service/ItemLinkServiceInterface'
import { UseCaseInterface } from '../UseCaseInterface'

export type GetUserItemLinksResponse =
  | {
      success: true
      itemShares: ItemLink[]
    }
  | {
      success: false
      message: string
    }

export class GetUserItemLinksUseCase implements UseCaseInterface {
  constructor(private itemShareService: ItemLinkServiceInterface) {}

  async execute(dto: { userUuid: string }): Promise<GetUserItemLinksResponse> {
    const result = await this.itemShareService.getUserItemLinks(dto.userUuid)

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

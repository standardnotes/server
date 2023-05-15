import { GroupServiceInterface } from './../../Group/Service/GroupServiceInterface'

import { UseCaseInterface } from '../UseCaseInterface'

export type AddUserToGroupResponse =
  | {
      success: true
    }
  | {
      success: false
      message: string
      errorTag: string
    }

export class AddUserToGroupUseCase implements UseCaseInterface {
  constructor(private groupService: GroupServiceInterface) {}

  async execute(dto: { groupUuid: string; userUuid: string }): Promise<GetSharedItemResponse> {
    const result = await this.groupService.addUserToGroup(dto)

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

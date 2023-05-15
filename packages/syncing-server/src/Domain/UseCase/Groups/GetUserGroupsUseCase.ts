import { GroupServiceInterface } from '../../Group/Service/GroupServiceInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { Group } from '../../Group/Model/Group'

export type GetUserGroupsUseCaseResult =
  | {
      success: true
      groups: Group[]
    }
  | {
      success: false
      message: string
    }

export class GetUserGroupsUseCase implements UseCaseInterface {
  constructor(private groupService: GroupServiceInterface) {}

  async execute(dto: { userUuid: string }): Promise<GetUserGroupsUseCaseResult> {
    const result = await this.groupService.getUserGroups(dto.userUuid)

    if (!result) {
      return {
        success: false,
        message: `Could not get user groups for user ${dto.userUuid}`,
      }
    }

    return {
      success: true,
      groups: result,
    }
  }
}

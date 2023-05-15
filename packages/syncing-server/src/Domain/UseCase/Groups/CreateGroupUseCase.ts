import { GroupServiceInterface } from '../../Group/Service/GroupServiceInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { Group } from '../../Group/Model/Group'

export type CreateGroupUseCaseResult =
  | {
      success: true
      group: Group
    }
  | {
      success: false
      message: string
    }

export class CreateGroupUseCase implements UseCaseInterface {
  constructor(private groupService: GroupServiceInterface) {}

  async execute(dto: { groupUuid: string }): Promise<CreateGroupUseCaseResult> {
    const result = await this.groupService.getGroup(dto.groupUuid)

    if (!result) {
      return {
        success: false,
        message: `Could not get group ${dto.groupUuid}`,
      }
    }

    return {
      success: true,
      group: result,
    }
  }
}

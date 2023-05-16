import { GetUserGroupKeysDTO } from '../../GroupUserKey/Service/GetUserGroupKeysDTO'
import { UseCaseInterface } from '../UseCaseInterface'
import { Group } from '../../Group/Model/Group'
import { GroupUserKeyServiceInterface } from '../../GroupUserKey/Service/GroupUserKeyService'

export type GetUserGroupKeysUseCaseResult =
  | {
      success: true
      groups: Group[]
    }
  | {
      success: false
      message: string
    }

export class GetUserGroupKeysUseCase implements UseCaseInterface {
  constructor(private groupUserService: GroupUserKeyServiceInterface) {}

  async execute(dto: GetUserGroupKeysDTO): Promise<GetUserGroupKeysUseCaseResult> {
    const result = await this.groupUserService.getUserGroupKeys(dto)

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

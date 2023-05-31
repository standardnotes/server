import { inject, injectable } from 'inversify'
import { GroupValetTokenData, TokenEncoderInterface, ValetTokenOperation } from '@standardnotes/security'
import { CreateValetTokenResponseData } from '@standardnotes/responses'
import TYPES from '../../../Bootstrap/Types'
import { UseCaseInterface } from '../UseCaseInterface'
import { CreateGroupFileValetTokenDTO } from './CreateGroupFileValetTokenDTO'
import { GroupUserServiceInterface } from '../../GroupUser/Service/GroupUserServiceInterface'
import { GroupServiceInterface } from '../../Group/Service/GroupServiceInterface'

@injectable()
export class CreateGroupFileValetToken implements UseCaseInterface {
  constructor(
    @inject(TYPES.GroupService) private groupService: GroupServiceInterface,
    @inject(TYPES.GroupUserService) private groupUserService: GroupUserServiceInterface,
    @inject(TYPES.ValetTokenEncoder) private tokenEncoder: TokenEncoderInterface<GroupValetTokenData>,
    @inject(TYPES.VALET_TOKEN_TTL) private valetTokenTTL: number,
  ) {}

  async execute(dto: CreateGroupFileValetTokenDTO): Promise<CreateValetTokenResponseData> {
    const failValue: CreateValetTokenResponseData = {
      success: false,
      reason: 'invalid-parameters',
    }

    const groupUser = await this.groupUserService.getUserForGroup({
      userUuid: dto.userUuid,
      groupUuid: dto.groupUuid,
    })
    if (!groupUser) {
      return failValue
    }
    if (groupUser.permissions === 'read' && dto.operation !== 'read') {
      return failValue
    }

    const group = await this.groupService.getGroup({
      groupUuid: dto.groupUuid,
    })
    if (!group) {
      return failValue
    }

    if (dto.operation === ValetTokenOperation.Move) {
      if (!dto.moveOperationType) {
        return failValue
      }

      if (dto.moveOperationType === 'group-to-group') {
        if (!dto.groupToGroupMoveTargetUuid) {
          return failValue
        }

        const toGroupUser = await this.groupUserService.getUserForGroup({
          userUuid: dto.userUuid,
          groupUuid: dto.groupToGroupMoveTargetUuid,
        })

        if (!toGroupUser) {
          return failValue
        }

        if (toGroupUser.permissions === 'read') {
          return failValue
        }
      }
    }

    const moveOperation: GroupValetTokenData['moveOperation'] = !dto.moveOperationType
      ? undefined
      : {
          type: dto.moveOperationType,
          fromUuid:
            dto.moveOperationType === 'group-to-user'
              ? dto.groupUuid
              : dto.moveOperationType === 'user-to-group'
              ? dto.userUuid
              : dto.moveOperationType === 'group-to-group'
              ? dto.groupUuid
              : 'invalid-uuid',
          toUuid:
            dto.moveOperationType === 'group-to-user'
              ? dto.userUuid
              : dto.moveOperationType === 'user-to-group'
              ? dto.groupUuid
              : dto.moveOperationType === 'group-to-group'
              ? (dto.groupToGroupMoveTargetUuid as string)
              : 'invalid-uuid',
        }

    const tokenData: GroupValetTokenData = {
      groupUuid: dto.groupUuid,
      permittedOperation: dto.operation,
      remoteIdentifier: dto.remoteIdentifier,
      uploadBytesUsed: group.fileUploadBytesUsed,
      uploadBytesLimit: group.fileUploadBytesLimit,
      unencryptedFileSize: dto.unencryptedFileSize,
      moveOperation: moveOperation,
    }

    const valetToken = this.tokenEncoder.encodeExpirableToken(tokenData, this.valetTokenTTL)

    return { success: true, valetToken }
  }
}

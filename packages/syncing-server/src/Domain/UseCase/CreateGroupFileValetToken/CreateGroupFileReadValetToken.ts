import { inject, injectable } from 'inversify'
import { GroupValetTokenData, TokenEncoderInterface, ValetTokenOperation } from '@standardnotes/security'
import { CreateValetTokenResponseData } from '@standardnotes/responses'
import TYPES from '../../../Bootstrap/Types'
import { UseCaseInterface } from '../UseCaseInterface'
import { CreateGroupFileReadValetTokenDTO } from './CreateGroupFileReadValetTokenDTO'
import { GetGlobalItem } from '../GetGlobalItem/GetGlobalItem'
import { GroupUserServiceInterface } from '../../GroupUser/Service/GroupUserServiceInterface'

@injectable()
export class CreateGroupFileReadValetToken implements UseCaseInterface {
  constructor(
    @inject(TYPES.GetGlobalItem) private getGlobalItem: GetGlobalItem,
    @inject(TYPES.GroupUserService) private groupUserService: GroupUserServiceInterface,
    @inject(TYPES.ValetTokenEncoder) private tokenEncoder: TokenEncoderInterface<GroupValetTokenData>,
    @inject(TYPES.VALET_TOKEN_TTL) private valetTokenTTL: number,
  ) {}

  async execute(dto: CreateGroupFileReadValetTokenDTO): Promise<CreateValetTokenResponseData> {
    const itemResponse = await this.getGlobalItem.execute({
      itemUuid: dto.fileUuid,
    })

    if (
      itemResponse.success === false ||
      !itemResponse.item.groupUuid ||
      itemResponse.item.groupUuid !== dto.groupUuid
    ) {
      return {
        success: false,
        reason: 'invalid-parameters',
      }
    }

    const groupUser = await this.groupUserService.getUserForGroup({
      userUuid: dto.userUuid,
      groupUuid: dto.groupUuid,
    })

    if (!groupUser) {
      return {
        success: false,
        reason: 'invalid-parameters',
      }
    }

    const tokenData: GroupValetTokenData = {
      groupUuid: dto.groupUuid,
      fileOwnerUuid: itemResponse.item.userUuid,
      permittedOperation: ValetTokenOperation.Read,
      remoteIdentifier: dto.remoteIdentifier,
    }

    const valetToken = this.tokenEncoder.encodeExpirableToken(tokenData, this.valetTokenTTL)

    return { success: true, valetToken }
  }
}

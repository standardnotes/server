import { inject, injectable } from 'inversify'

import { SharedValetTokenData, TokenEncoderInterface, ValetTokenOperation } from '@standardnotes/security'
import { CreateValetTokenResponseData } from '@standardnotes/responses'

import TYPES from '../../../Bootstrap/Types'
import { UseCaseInterface } from '../UseCaseInterface'
import { CreateSharedFileValetTokenDTO } from './CreateSharedFileValetTokenDTO'
import { GetSharedItemUseCase } from '../ItemShare/GetSharedItemUseCase'

@injectable()
export class CreateSharedFileValetToken implements UseCaseInterface {
  constructor(
    @inject(TYPES.GetSharedItem) private getSharedItem: GetSharedItemUseCase,
    @inject(TYPES.ValetTokenEncoder) private tokenEncoder: TokenEncoderInterface<SharedValetTokenData>,
    @inject(TYPES.VALET_TOKEN_TTL) private valetTokenTTL: number,
  ) {}

  async execute(dto: CreateSharedFileValetTokenDTO): Promise<CreateValetTokenResponseData> {
    const sharedItemResult = await this.getSharedItem.execute({
      shareToken: dto.shareToken,
    })

    if (sharedItemResult.success === false) {
      return {
        success: false,
        reason: 'invalid-parameters',
      }
    }

    const tokenData: SharedValetTokenData = {
      sharingUserUuid: dto.sharingUserUuid,
      permittedOperation: ValetTokenOperation.Read,
      permittedResources: [
        {
          remoteIdentifier: dto.remoteIdentifier,
        },
      ],
    }

    const valetToken = this.tokenEncoder.encodeExpirableToken(tokenData, this.valetTokenTTL)

    return { success: true, valetToken }
  }
}

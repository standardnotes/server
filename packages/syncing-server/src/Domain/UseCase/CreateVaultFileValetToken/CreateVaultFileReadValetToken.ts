import { inject, injectable } from 'inversify'
import { VaultValetTokenData, TokenEncoderInterface, ValetTokenOperation } from '@standardnotes/security'
import { CreateValetTokenResponseData } from '@standardnotes/responses'
import TYPES from '../../../Bootstrap/Types'
import { UseCaseInterface } from '../UseCaseInterface'
import { CreateVaultFileReadValetTokenDTO } from './CreateVaultFileReadValetTokenDTO'
import { GetGlobalItem } from '../GetGlobalItem/GetGlobalItem'
import { VaultUserServiceInterface } from '../../VaultUser/Service/VaultUserServiceInterface'

@injectable()
export class CreateVaultFileReadValetToken implements UseCaseInterface {
  constructor(
    @inject(TYPES.GetGlobalItem) private getGlobalItem: GetGlobalItem,
    @inject(TYPES.VaultUserService) private vaultUserService: VaultUserServiceInterface,
    @inject(TYPES.ValetTokenEncoder) private tokenEncoder: TokenEncoderInterface<VaultValetTokenData>,
    @inject(TYPES.VALET_TOKEN_TTL) private valetTokenTTL: number,
  ) {}

  async execute(dto: CreateVaultFileReadValetTokenDTO): Promise<CreateValetTokenResponseData> {
    const itemResponse = await this.getGlobalItem.execute({
      itemUuid: dto.fileUuid,
    })

    if (
      itemResponse.success === false ||
      !itemResponse.item.vaultUuid ||
      itemResponse.item.vaultUuid !== dto.vaultUuid
    ) {
      return {
        success: false,
        reason: 'invalid-parameters',
      }
    }

    const vaultUser = await this.vaultUserService.getUserForVault({
      userUuid: dto.userUuid,
      vaultUuid: dto.vaultUuid,
    })

    if (!vaultUser) {
      return {
        success: false,
        reason: 'invalid-parameters',
      }
    }

    const tokenData: VaultValetTokenData = {
      vaultUuid: dto.vaultUuid,
      permittedOperation: ValetTokenOperation.Read,
      remoteIdentifier: dto.remoteIdentifier,
    }

    const valetToken = this.tokenEncoder.encodeExpirableToken(tokenData, this.valetTokenTTL)

    return { success: true, valetToken }
  }
}

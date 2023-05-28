import { inject, injectable } from 'inversify'
import { VaultValetTokenData, TokenEncoderInterface, ValetTokenOperation } from '@standardnotes/security'
import { CreateValetTokenResponseData } from '@standardnotes/responses'
import TYPES from '../../../Bootstrap/Types'
import { UseCaseInterface } from '../UseCaseInterface'
import { CreateVaultFileValetTokenDTO } from './CreateVaultFileValetTokenDTO'
import { GetGlobalItem } from '../GetGlobalItem/GetGlobalItem'
import { VaultUserServiceInterface } from '../../VaultUser/Service/VaultUserServiceInterface'
import { VaultServiceInterface } from '../../Vault/Service/VaultServiceInterface'

@injectable()
export class CreateVaultFileValetToken implements UseCaseInterface {
  constructor(
    @inject(TYPES.GetGlobalItem) private getGlobalItem: GetGlobalItem,
    @inject(TYPES.VaultService) private vaultService: VaultServiceInterface,
    @inject(TYPES.VaultUserService) private vaultUserService: VaultUserServiceInterface,
    @inject(TYPES.ValetTokenEncoder) private tokenEncoder: TokenEncoderInterface<VaultValetTokenData>,
    @inject(TYPES.VALET_TOKEN_TTL) private valetTokenTTL: number,
  ) {}

  async execute(dto: CreateVaultFileValetTokenDTO): Promise<CreateValetTokenResponseData> {
    const itemResponse = await this.getGlobalItem.execute({
      itemUuid: dto.fileUuid,
    })

    const failValue: CreateValetTokenResponseData = {
      success: false,
      reason: 'invalid-parameters',
    }

    if (itemResponse.success === false) {
      return failValue
    }

    if (!itemResponse.item.vaultUuid || itemResponse.item.vaultUuid !== dto.vaultUuid) {
      return failValue
    }

    const vaultUser = await this.vaultUserService.getUserForVault({
      userUuid: dto.userUuid,
      vaultUuid: dto.vaultUuid,
    })

    if (!vaultUser) {
      return failValue
    }

    const vault = await this.vaultService.getVault({
      vaultUuid: dto.vaultUuid,
    })

    if (!vault) {
      return failValue
    }

    const tokenData: VaultValetTokenData = {
      vaultUuid: dto.vaultUuid,
      permittedOperation: dto.operation,
      remoteIdentifier: dto.remoteIdentifier,
      uploadBytesUsed: vault.fileUploadBytesUsed,
      uploadBytesLimit: vault.fileUploadBytesLimit,
    }

    if (dto.operation === ValetTokenOperation.Move) {
      if (!dto.moveOperationType) {
        return failValue
      }

      if (dto.moveOperationType === 'vault-to-user') {
        if (vaultUser.permissions === 'read') {
          return failValue
        } else {
          tokenData.moveOperation = {
            type: 'vault-to-user',
            userUuid: dto.userUuid,
          }
        }
      } else if (dto.moveOperationType === 'user-to-vault') {
        if (vaultUser.permissions === 'read') {
          return failValue
        } else {
          tokenData.moveOperation = {
            type: 'user-to-vault',
            userUuid: dto.userUuid,
          }
        }
      } else {
        return failValue
      }
    }

    const valetToken = this.tokenEncoder.encodeExpirableToken(tokenData, this.valetTokenTTL)

    return { success: true, valetToken }
  }
}

import { inject, injectable } from 'inversify'
import { VaultValetTokenData, TokenEncoderInterface, ValetTokenOperation } from '@standardnotes/security'
import { CreateValetTokenResponseData } from '@standardnotes/responses'
import TYPES from '../../../Bootstrap/Types'
import { UseCaseInterface } from '../UseCaseInterface'
import { CreateVaultFileValetTokenDTO } from './CreateVaultFileValetTokenDTO'
import { VaultUserServiceInterface } from '../../VaultUser/Service/VaultUserServiceInterface'
import { VaultServiceInterface } from '../../Vault/Service/VaultServiceInterface'

@injectable()
export class CreateVaultFileValetToken implements UseCaseInterface {
  constructor(
    @inject(TYPES.VaultService) private vaultService: VaultServiceInterface,
    @inject(TYPES.VaultUserService) private vaultUserService: VaultUserServiceInterface,
    @inject(TYPES.ValetTokenEncoder) private tokenEncoder: TokenEncoderInterface<VaultValetTokenData>,
    @inject(TYPES.VALET_TOKEN_TTL) private valetTokenTTL: number,
  ) {}

  async execute(dto: CreateVaultFileValetTokenDTO): Promise<CreateValetTokenResponseData> {
    const failValue: CreateValetTokenResponseData = {
      success: false,
      reason: 'invalid-parameters',
    }

    const vaultUser = await this.vaultUserService.getUserForVault({
      userUuid: dto.userUuid,
      vaultUuid: dto.vaultUuid,
    })
    if (!vaultUser) {
      return failValue
    }
    if (vaultUser.permissions === 'read' && dto.operation !== 'read') {
      return failValue
    }

    const vault = await this.vaultService.getVault({
      vaultUuid: dto.vaultUuid,
    })
    if (!vault) {
      return failValue
    }

    if (dto.operation === ValetTokenOperation.Move) {
      if (!dto.moveOperationType) {
        return failValue
      }

      if (dto.moveOperationType === 'vault-to-vault') {
        if (!dto.vaultToVaultMoveTargetUuid) {
          return failValue
        }

        const toVaultUser = await this.vaultUserService.getUserForVault({
          userUuid: dto.userUuid,
          vaultUuid: dto.vaultToVaultMoveTargetUuid,
        })

        if (!toVaultUser) {
          return failValue
        }

        if (toVaultUser.permissions === 'read') {
          return failValue
        }
      }
    }

    const moveOperation: VaultValetTokenData['moveOperation'] = !dto.moveOperationType
      ? undefined
      : {
          type: dto.moveOperationType,
          fromUuid:
            dto.moveOperationType === 'vault-to-user'
              ? dto.vaultUuid
              : dto.moveOperationType === 'user-to-vault'
              ? dto.userUuid
              : dto.moveOperationType === 'vault-to-vault'
              ? dto.vaultUuid
              : 'invalid-uuid',
          toUuid:
            dto.moveOperationType === 'vault-to-user'
              ? dto.userUuid
              : dto.moveOperationType === 'user-to-vault'
              ? dto.vaultUuid
              : dto.moveOperationType === 'vault-to-vault'
              ? (dto.vaultToVaultMoveTargetUuid as string)
              : 'invalid-uuid',
        }

    const tokenData: VaultValetTokenData = {
      vaultUuid: dto.vaultUuid,
      permittedOperation: dto.operation,
      remoteIdentifier: dto.remoteIdentifier,
      uploadBytesUsed: vault.fileUploadBytesUsed,
      uploadBytesLimit: vault.fileUploadBytesLimit,
      unencryptedFileSize: dto.unencryptedFileSize,
      moveOperation: moveOperation,
    }

    const valetToken = this.tokenEncoder.encodeExpirableToken(tokenData, this.valetTokenTTL)

    return { success: true, valetToken }
  }
}

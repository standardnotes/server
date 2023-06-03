import { inject, injectable } from 'inversify'
import { SharedVaultValetTokenData, TokenEncoderInterface, ValetTokenOperation } from '@standardnotes/security'
import { CreateValetTokenResponseData } from '@standardnotes/responses'
import TYPES from '../../../Bootstrap/Types'
import { UseCaseInterface } from '../UseCaseInterface'
import { CreateSharedVaultFileValetTokenDTO } from './CreateSharedVaultFileValetTokenDTO'
import { SharedVaultUserServiceInterface } from '../../SharedVaultUser/Service/SharedVaultUserServiceInterface'
import { SharedVaultServiceInterface } from '../../SharedVault/Service/SharedVaultServiceInterface'

@injectable()
export class CreateSharedVaultFileValetToken implements UseCaseInterface {
  constructor(
    @inject(TYPES.SharedVaultService) private sharedVaultService: SharedVaultServiceInterface,
    @inject(TYPES.SharedVaultUserService) private sharedVaultUserService: SharedVaultUserServiceInterface,
    @inject(TYPES.ValetTokenEncoder) private tokenEncoder: TokenEncoderInterface<SharedVaultValetTokenData>,
    @inject(TYPES.VALET_TOKEN_TTL) private valetTokenTTL: number,
  ) {}

  async execute(dto: CreateSharedVaultFileValetTokenDTO): Promise<CreateValetTokenResponseData> {
    const failValue: CreateValetTokenResponseData = {
      success: false,
      reason: 'invalid-parameters',
    }

    const sharedVaultUser = await this.sharedVaultUserService.getUserForSharedVault({
      userUuid: dto.userUuid,
      sharedVaultUuid: dto.sharedVaultUuid,
    })
    if (!sharedVaultUser) {
      return failValue
    }
    if (sharedVaultUser.permissions === 'read' && dto.operation !== 'read') {
      return failValue
    }

    const sharedVault = await this.sharedVaultService.getSharedVault({
      sharedVaultUuid: dto.sharedVaultUuid,
    })
    if (!sharedVault) {
      return failValue
    }

    if (dto.operation === ValetTokenOperation.Move) {
      if (!dto.moveOperationType) {
        return failValue
      }

      if (dto.moveOperationType === 'shared-vault-to-shared-vault') {
        if (!dto.sharedVaultToSharedVaultMoveTargetUuid) {
          return failValue
        }

        const toSharedVaultUser = await this.sharedVaultUserService.getUserForSharedVault({
          userUuid: dto.userUuid,
          sharedVaultUuid: dto.sharedVaultToSharedVaultMoveTargetUuid,
        })

        if (!toSharedVaultUser) {
          return failValue
        }

        if (toSharedVaultUser.permissions === 'read') {
          return failValue
        }
      }
    }

    const moveOperation: SharedVaultValetTokenData['moveOperation'] = !dto.moveOperationType
      ? undefined
      : {
          type: dto.moveOperationType,
          fromUuid:
            dto.moveOperationType === 'shared-vault-to-user'
              ? dto.sharedVaultUuid
              : dto.moveOperationType === 'user-to-shared-vault'
              ? dto.userUuid
              : dto.moveOperationType === 'shared-vault-to-shared-vault'
              ? dto.sharedVaultUuid
              : 'invalid-uuid',
          toUuid:
            dto.moveOperationType === 'shared-vault-to-user'
              ? dto.userUuid
              : dto.moveOperationType === 'user-to-shared-vault'
              ? dto.sharedVaultUuid
              : dto.moveOperationType === 'shared-vault-to-shared-vault'
              ? (dto.sharedVaultToSharedVaultMoveTargetUuid as string)
              : 'invalid-uuid',
        }

    const tokenData: SharedVaultValetTokenData = {
      sharedVaultUuid: dto.sharedVaultUuid,
      permittedOperation: dto.operation,
      remoteIdentifier: dto.remoteIdentifier,
      uploadBytesUsed: sharedVault.fileUploadBytesUsed,
      uploadBytesLimit: sharedVault.fileUploadBytesLimit,
      unencryptedFileSize: dto.unencryptedFileSize,
      moveOperation: moveOperation,
    }

    const valetToken = this.tokenEncoder.encodeExpirableToken(tokenData, this.valetTokenTTL)

    return { success: true, valetToken }
  }
}

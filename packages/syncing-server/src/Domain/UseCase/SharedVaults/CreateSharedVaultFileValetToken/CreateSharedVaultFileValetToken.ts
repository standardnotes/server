import { SharedVaultValetTokenData, TokenEncoderInterface, ValetTokenOperation } from '@standardnotes/security'

import { SharedVaultRepositoryInterface } from '../../../SharedVault/SharedVaultRepositoryInterface'
import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { SharedVaultUserRepositoryInterface } from '../../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { CreateSharedVaultFileValetTokenDTO } from './CreateSharedVaultFileValetTokenDTO'
import { SharedVaultUserPermission } from '../../../SharedVault/User/SharedVaultUserPermission'

export class CreateSharedVaultFileValetToken implements UseCaseInterface<string> {
  constructor(
    private sharedVaultRepository: SharedVaultRepositoryInterface,
    private sharedVaultUserRepository: SharedVaultUserRepositoryInterface,
    private tokenEncoder: TokenEncoderInterface<SharedVaultValetTokenData>,
    private valetTokenTTL: number,
  ) {}

  async execute(dto: CreateSharedVaultFileValetTokenDTO): Promise<Result<string>> {
    const sharedVaultUuidOrError = Uuid.create(dto.sharedVaultUuid)
    if (sharedVaultUuidOrError.isFailed()) {
      return Result.fail(sharedVaultUuidOrError.getError())
    }
    const sharedVaultUuid = sharedVaultUuidOrError.getValue()

    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const sharedVault = await this.sharedVaultRepository.findByUuid(sharedVaultUuid)
    if (!sharedVault) {
      return Result.fail('Shared vault not found')
    }

    const sharedVaultUser = await this.sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid({
      userUuid: userUuid,
      sharedVaultUuid: sharedVaultUuid,
    })
    if (!sharedVaultUser) {
      return Result.fail('Shared vault user not found')
    }

    if (
      sharedVaultUser.props.permission.equals(
        SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Read).getValue(),
      ) &&
      dto.operation !== ValetTokenOperation.Read
    ) {
      return Result.fail('User does not have permission to perform this operation')
    }

    if (dto.operation === ValetTokenOperation.Move) {
      if (!dto.moveOperationType) {
        return Result.fail('Move operation type is required')
      }

      if (dto.moveOperationType === 'shared-vault-to-shared-vault') {
        if (!dto.sharedVaultToSharedVaultMoveTargetUuid) {
          return Result.fail('Shared vault to shared vault move target uuid is required')
        }

        const sharedVaultTargetUuidOrError = Uuid.create(dto.sharedVaultToSharedVaultMoveTargetUuid)
        if (sharedVaultTargetUuidOrError.isFailed()) {
          return Result.fail(sharedVaultTargetUuidOrError.getError())
        }
        const sharedVaultTargetUuid = sharedVaultTargetUuidOrError.getValue()

        const toSharedVaultUser = await this.sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid({
          userUuid: userUuid,
          sharedVaultUuid: sharedVaultTargetUuid,
        })

        if (!toSharedVaultUser) {
          return Result.fail('Shared vault target user not found')
        }

        if (
          toSharedVaultUser.props.permission.equals(
            SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Read).getValue(),
          )
        ) {
          return Result.fail('User does not have permission to perform this operation')
        }
      }
    }

    const tokenData: SharedVaultValetTokenData = {
      sharedVaultUuid: dto.sharedVaultUuid,
      permittedOperation: dto.operation,
      remoteIdentifier: dto.remoteIdentifier,
      uploadBytesUsed: sharedVault.props.fileUploadBytesUsed,
      uploadBytesLimit: sharedVault.props.fileUploadBytesLimit,
      unencryptedFileSize: dto.unencryptedFileSize,
      moveOperation: this.createMoveOperationData(dto),
    }

    const valetToken = this.tokenEncoder.encodeExpirableToken(tokenData, this.valetTokenTTL)

    return Result.ok(valetToken)
  }

  private createMoveOperationData(dto: CreateSharedVaultFileValetTokenDTO): SharedVaultValetTokenData['moveOperation'] {
    if (!dto.moveOperationType) {
      return undefined
    }

    let fromUuid: string
    let toUuid: string
    switch (dto.moveOperationType) {
      case 'shared-vault-to-user':
        fromUuid = dto.sharedVaultUuid
        toUuid = dto.userUuid
        break
      case 'user-to-shared-vault':
        fromUuid = dto.userUuid
        toUuid = dto.sharedVaultUuid
        break
      case 'shared-vault-to-shared-vault':
        fromUuid = dto.sharedVaultUuid
        toUuid = dto.sharedVaultToSharedVaultMoveTargetUuid as string
        break
    }

    return {
      type: dto.moveOperationType,
      fromUuid,
      toUuid,
    }
  }
}

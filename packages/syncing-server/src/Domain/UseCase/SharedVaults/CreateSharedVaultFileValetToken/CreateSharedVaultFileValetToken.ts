import {
  SharedVaultMoveType,
  SharedVaultValetTokenData,
  TokenEncoderInterface,
  ValetTokenOperation,
} from '@standardnotes/security'
import { Result, SharedVaultUserPermission, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { SharedVaultRepositoryInterface } from '../../../SharedVault/SharedVaultRepositoryInterface'
import { SharedVaultUserRepositoryInterface } from '../../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { CreateSharedVaultFileValetTokenDTO } from './CreateSharedVaultFileValetTokenDTO'
import { SharedVault } from '../../../SharedVault/SharedVault'

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

    let targetSharedVault: SharedVault | null = null
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

        targetSharedVault = await this.sharedVaultRepository.findByUuid(sharedVaultTargetUuid)
        if (!targetSharedVault) {
          return Result.fail('Target shared vault not found')
        }

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

    const fromSharedVaultUuid = ['shared-vault-to-user', 'shared-vault-to-shared-vault'].includes(
      dto.moveOperationType as string,
    )
      ? sharedVaultUuid.value
      : undefined

    const fromOwnerUuid =
      dto.moveOperationType === 'user-to-shared-vault' ? userUuid.value : sharedVault.props.userUuid.value

    const toSharedVaultUuid = targetSharedVault
      ? targetSharedVault.id.toString()
      : dto.moveOperationType === 'shared-vault-to-user'
      ? undefined
      : sharedVaultUuid.value

    const toOwnerUuid =
      dto.moveOperationType === 'user-to-shared-vault'
        ? sharedVault.props.userUuid.value
        : targetSharedVault
        ? targetSharedVault.props.userUuid.value
        : userUuid.value

    const tokenData: SharedVaultValetTokenData = {
      sharedVaultUuid: dto.sharedVaultUuid,
      vaultOwnerUuid: sharedVault.props.userUuid.value,
      permittedOperation: dto.operation,
      remoteIdentifier: dto.remoteIdentifier,
      uploadBytesUsed: sharedVault.props.fileUploadBytesUsed,
      uploadBytesLimit: dto.sharedVaultOwnerUploadBytesLimit,
      unencryptedFileSize: dto.unencryptedFileSize,
      moveOperation: {
        type: dto.moveOperationType as SharedVaultMoveType,
        from: {
          sharedVaultUuid: fromSharedVaultUuid,
          ownerUuid: fromOwnerUuid,
        },
        to: {
          sharedVaultUuid: toSharedVaultUuid,
          ownerUuid: toOwnerUuid,
        },
      },
    }

    const valetToken = this.tokenEncoder.encodeExpirableToken(tokenData, this.valetTokenTTL)

    return Result.ok(valetToken)
  }
}

import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { DeleteSharedVaultDTO } from './DeleteSharedVaultDTO'
import { SharedVaultRepositoryInterface } from '../../../SharedVault/SharedVaultRepositoryInterface'
import { SharedVaultUserRepositoryInterface } from '../../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { SharedVaultInviteRepositoryInterface } from '../../../SharedVault/User/Invite/SharedVaultInviteRepositoryInterface'
import { RemoveUserFromSharedVault } from '../RemoveUserFromSharedVault/RemoveUserFromSharedVault'

export class DeleteSharedVault implements UseCaseInterface<void> {
  constructor(
    private sharedVaultRepository: SharedVaultRepositoryInterface,
    private sharedVaultUserRepository: SharedVaultUserRepositoryInterface,
    private sharedVaultInviteRepository: SharedVaultInviteRepositoryInterface,
    private removeUserFromSharedVault: RemoveUserFromSharedVault,
  ) {}

  async execute(dto: DeleteSharedVaultDTO): Promise<Result<void>> {
    const originatorUuidOrError = Uuid.create(dto.originatorUuid)
    if (originatorUuidOrError.isFailed()) {
      return Result.fail(originatorUuidOrError.getError())
    }
    const originatorUuid = originatorUuidOrError.getValue()

    const sharedVaultUuidOrError = Uuid.create(dto.sharedVaultUuid)
    if (sharedVaultUuidOrError.isFailed()) {
      return Result.fail(sharedVaultUuidOrError.getError())
    }
    const sharedVaultUuid = sharedVaultUuidOrError.getValue()

    const sharedVault = await this.sharedVaultRepository.findByUuid(sharedVaultUuid)
    if (!sharedVault) {
      return Result.fail('Shared vault not found')
    }

    if (sharedVault.props.userUuid.value !== originatorUuid.value) {
      return Result.fail('Shared vault does not belong to the user')
    }

    const sharedVaultUsers = await this.sharedVaultUserRepository.findBySharedVaultUuid(sharedVaultUuid)
    for (const sharedVaultUser of sharedVaultUsers) {
      const result = await this.removeUserFromSharedVault.execute({
        originatorUuid: originatorUuid.value,
        sharedVaultUuid: sharedVaultUuid.value,
        userUuid: sharedVaultUser.props.userUuid.value,
      })

      if (result.isFailed()) {
        return Result.fail(result.getError())
      }
    }

    await this.sharedVaultInviteRepository.removeBySharedVaultUuid(sharedVaultUuid)

    await this.sharedVaultRepository.remove(sharedVault)

    return Result.ok()
  }
}

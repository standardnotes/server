import { Result, SharedVaultUser, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { GetSharedVaultUsersDTO } from './GetSharedVaultUsersDTO'
import { SharedVaultUserRepositoryInterface } from '../../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { SharedVaultRepositoryInterface } from '../../../SharedVault/SharedVaultRepositoryInterface'

export class GetSharedVaultUsers implements UseCaseInterface<SharedVaultUser[]> {
  constructor(
    private sharedVaultUsersRepository: SharedVaultUserRepositoryInterface,
    private sharedVaultRepository: SharedVaultRepositoryInterface,
  ) {}

  async execute(dto: GetSharedVaultUsersDTO): Promise<Result<SharedVaultUser[]>> {
    const sharedVaultUuidOrError = Uuid.create(dto.sharedVaultUuid)
    if (sharedVaultUuidOrError.isFailed()) {
      return Result.fail(sharedVaultUuidOrError.getError())
    }
    const sharedVaultUuid = sharedVaultUuidOrError.getValue()

    const originatorUuidOrError = Uuid.create(dto.originatorUuid)
    if (originatorUuidOrError.isFailed()) {
      return Result.fail(originatorUuidOrError.getError())
    }
    const originatorUuid = originatorUuidOrError.getValue()

    const sharedVault = await this.sharedVaultRepository.findByUuid(sharedVaultUuid)
    if (!sharedVault) {
      return Result.fail('Shared vault not found')
    }

    const isOriginatorTheOwnerOfTheSharedVault = sharedVault.props.userUuid.equals(originatorUuid)
    if (!isOriginatorTheOwnerOfTheSharedVault) {
      return Result.fail('Only the owner can get shared vault users')
    }

    const sharedVaultUsers = await this.sharedVaultUsersRepository.findBySharedVaultUuid(sharedVaultUuid)

    return Result.ok(sharedVaultUsers)
  }
}

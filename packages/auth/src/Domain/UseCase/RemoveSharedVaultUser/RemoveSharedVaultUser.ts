import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { SharedVaultUserRepositoryInterface } from '../../SharedVault/SharedVaultUserRepositoryInterface'
import { RemoveSharedVaultUserDTO } from './RemoveSharedVaultUserDTO'

export class RemoveSharedVaultUser implements UseCaseInterface<void> {
  constructor(private sharedVaultUserRepository: SharedVaultUserRepositoryInterface) {}

  async execute(dto: RemoveSharedVaultUserDTO): Promise<Result<void>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    let sharedVaultUuid: Uuid | undefined
    if (dto.sharedVaultUuid !== undefined) {
      const sharedVaultUuidOrError = Uuid.create(dto.sharedVaultUuid)
      if (sharedVaultUuidOrError.isFailed()) {
        return Result.fail(sharedVaultUuidOrError.getError())
      }
      sharedVaultUuid = sharedVaultUuidOrError.getValue()
    }

    if (sharedVaultUuid) {
      const sharedVaultUser = await this.sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid({
        userUuid,
        sharedVaultUuid,
      })
      if (!sharedVaultUser) {
        return Result.fail('Shared vault user not found')
      }

      await this.sharedVaultUserRepository.remove(sharedVaultUser)
    } else {
      const sharedVaultUsers = await this.sharedVaultUserRepository.findByUserUuid(userUuid)
      for (const sharedVaultUser of sharedVaultUsers) {
        await this.sharedVaultUserRepository.remove(sharedVaultUser)
      }
    }

    return Result.ok()
  }
}

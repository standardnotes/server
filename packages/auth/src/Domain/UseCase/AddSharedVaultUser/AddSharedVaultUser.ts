import {
  Result,
  SharedVaultUser,
  SharedVaultUserPermission,
  Timestamps,
  UseCaseInterface,
  Uuid,
} from '@standardnotes/domain-core'

import { SharedVaultUserRepositoryInterface } from '../../SharedVault/SharedVaultUserRepositoryInterface'
import { AddSharedVaultUserDTO } from './AddSharedVaultUserDTO'

export class AddSharedVaultUser implements UseCaseInterface<void> {
  constructor(private sharedVaultUserRepository: SharedVaultUserRepositoryInterface) {}

  async execute(dto: AddSharedVaultUserDTO): Promise<Result<void>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const sharedVaultUuidOrError = Uuid.create(dto.sharedVaultUuid)
    if (sharedVaultUuidOrError.isFailed()) {
      return Result.fail(sharedVaultUuidOrError.getError())
    }
    const sharedVaultUuid = sharedVaultUuidOrError.getValue()

    const permissionOrError = SharedVaultUserPermission.create(dto.permission)
    if (permissionOrError.isFailed()) {
      return Result.fail(permissionOrError.getError())
    }
    const permission = permissionOrError.getValue()

    const timestampsOrError = Timestamps.create(dto.createdAt, dto.updatedAt)
    if (timestampsOrError.isFailed()) {
      return Result.fail(timestampsOrError.getError())
    }
    const timestamps = timestampsOrError.getValue()

    const sharedVaultUserOrError = SharedVaultUser.create({
      userUuid,
      sharedVaultUuid,
      permission,
      timestamps,
      isDesignatedSurvivor: false,
    })
    if (sharedVaultUserOrError.isFailed()) {
      return Result.fail(sharedVaultUserOrError.getError())
    }
    const sharedVaultUser = sharedVaultUserOrError.getValue()

    await this.sharedVaultUserRepository.save(sharedVaultUser)

    return Result.ok()
  }
}

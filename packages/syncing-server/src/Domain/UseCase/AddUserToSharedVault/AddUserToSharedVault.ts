import { Result, Timestamps, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

import { AddUserToSharedVaultDTO } from './AddUserToSharedVaultDTO'
import { SharedVaultRepositoryInterface } from '../../SharedVault/SharedVaultRepositoryInterface'
import { SharedVaultUser } from '../../SharedVault/User/SharedVaultUser'
import { SharedVaultUserRepositoryInterface } from '../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { SharedVaultUserPermission } from '../../SharedVault/User/SharedVaultUserPermission'
import { RemoveUserEvents } from '../RemoveUserEvents/RemoveUserEvents'

export class AddUserToSharedVault implements UseCaseInterface<SharedVaultUser> {
  constructor(
    private removeUserEvents: RemoveUserEvents,
    private sharedVaultRepository: SharedVaultRepositoryInterface,
    private sharedVaultUserRepository: SharedVaultUserRepositoryInterface,
    private timer: TimerInterface,
  ) {}

  async execute(dto: AddUserToSharedVaultDTO): Promise<Result<SharedVaultUser>> {
    const sharedVaultUuidOrError = Uuid.create(dto.sharedVaultUuid)
    if (sharedVaultUuidOrError.isFailed()) {
      return Result.fail(sharedVaultUuidOrError.getError())
    }
    const sharedVaultUuid = sharedVaultUuidOrError.getValue()

    const sharedVault = await this.sharedVaultRepository.findByUuid(sharedVaultUuid)
    if (!sharedVault) {
      return Result.fail('Attempting to add a shared vault user to a non-existent shared vault')
    }

    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const permissionOrError = SharedVaultUserPermission.create(dto.permission)
    if (permissionOrError.isFailed()) {
      return Result.fail(permissionOrError.getError())
    }
    const permission = permissionOrError.getValue()

    const removingEventsResult = await this.removeUserEvents.execute({
      sharedVaultUuid: sharedVaultUuid.value,
      userUuid: userUuid.value,
    })
    if (removingEventsResult.isFailed()) {
      return Result.fail(removingEventsResult.getError())
    }

    const timestamps = Timestamps.create(
      this.timer.getTimestampInMicroseconds(),
      this.timer.getTimestampInMicroseconds(),
    ).getValue()

    const sharedVaultUserOrError = SharedVaultUser.create({
      userUuid,
      sharedVaultUuid,
      permission,
      timestamps,
    })
    if (sharedVaultUserOrError.isFailed()) {
      return Result.fail(sharedVaultUserOrError.getError())
    }
    const sharedVaultUser = sharedVaultUserOrError.getValue()

    await this.sharedVaultUserRepository.save(sharedVaultUser)

    return Result.ok(sharedVaultUser)
  }
}

import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { RemoveUserFromSharedVaultDTO } from './RemoveUserFromSharedVaultDTO'
import { SharedVaultRepositoryInterface } from '../../../SharedVault/SharedVaultRepositoryInterface'
import { SharedVaultUserRepositoryInterface } from '../../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { NotificationType } from '../../../Notifications/NotificationType'
import { AddNotificationForUser } from '../../Messaging/AddNotificationForUser/AddNotificationForUser'

export class RemoveUserFromSharedVault implements UseCaseInterface<void> {
  constructor(
    private sharedVaultUsersRepository: SharedVaultUserRepositoryInterface,
    private sharedVaultRepository: SharedVaultRepositoryInterface,
    private addNotificationForUser: AddNotificationForUser,
  ) {}

  async execute(dto: RemoveUserFromSharedVaultDTO): Promise<Result<void>> {
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

    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const sharedVault = await this.sharedVaultRepository.findByUuid(sharedVaultUuid)
    if (!sharedVault) {
      return Result.fail('Shared vault not found')
    }

    const originatorIsOwner = sharedVault.props.userUuid.equals(originatorUuid)
    if (!originatorIsOwner) {
      return Result.fail('Only owner can remove users from shared vault')
    }

    const removingOwner = sharedVault.props.userUuid.equals(userUuid)
    if (removingOwner) {
      return Result.fail('Owner cannot be removed from shared vault')
    }

    const sharedVaultUser = await this.sharedVaultUsersRepository.findByUserUuidAndSharedVaultUuid({
      userUuid,
      sharedVaultUuid,
    })
    if (!sharedVaultUser) {
      return Result.fail('User is not a member of the shared vault')
    }

    await this.sharedVaultUsersRepository.remove(sharedVaultUser)

    const result = await this.addNotificationForUser.execute({
      userUuid: sharedVaultUser.props.userUuid.value,
      type: NotificationType.TYPES.RemovedFromSharedVault,
      payload: JSON.stringify({
        sharedVaultUuid: sharedVault.id.toString(),
      }),
      version: '1.0',
    })
    if (result.isFailed()) {
      return Result.fail(result.getError())
    }

    return Result.ok()
  }
}

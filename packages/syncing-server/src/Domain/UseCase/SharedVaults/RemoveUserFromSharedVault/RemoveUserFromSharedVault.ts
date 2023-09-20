import { NotificationPayload, NotificationType, Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'

import { RemoveUserFromSharedVaultDTO } from './RemoveUserFromSharedVaultDTO'
import { SharedVaultRepositoryInterface } from '../../../SharedVault/SharedVaultRepositoryInterface'
import { SharedVaultUserRepositoryInterface } from '../../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'
import { AddNotificationsForUsers } from '../../Messaging/AddNotificationsForUsers/AddNotificationsForUsers'
import { AddNotificationForUser } from '../../Messaging/AddNotificationForUser/AddNotificationForUser'

export class RemoveUserFromSharedVault implements UseCaseInterface<void> {
  constructor(
    private sharedVaultUsersRepository: SharedVaultUserRepositoryInterface,
    private sharedVaultRepository: SharedVaultRepositoryInterface,
    private addNotificationsForUsers: AddNotificationsForUsers,
    private addNotificationForUser: AddNotificationForUser,
    private domainEventFactory: DomainEventFactoryInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
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
    const removingSomeoneElseWhenNotOwner = !originatorIsOwner && !userUuid.equals(originatorUuid)
    if (removingSomeoneElseWhenNotOwner) {
      return Result.fail('Only owner can remove other users from shared vault')
    }

    const removingOwner = sharedVault.props.userUuid.equals(userUuid)
    if (removingOwner && !dto.forceRemoveOwner) {
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

    const notificationPayloadOrError = NotificationPayload.create({
      sharedVaultUuid: sharedVault.uuid,
      type: NotificationType.create(NotificationType.TYPES.UserRemovedFromSharedVault).getValue(),
      version: '1.0',
    })
    if (notificationPayloadOrError.isFailed()) {
      return Result.fail(notificationPayloadOrError.getError())
    }
    const notificationPayload = notificationPayloadOrError.getValue()

    const result = await this.addNotificationsForUsers.execute({
      sharedVaultUuid: sharedVault.id.toString(),
      exceptUserUuid: userUuid.value,
      type: NotificationType.TYPES.UserRemovedFromSharedVault,
      payload: notificationPayload,
      version: '1.0',
    })
    if (result.isFailed()) {
      return Result.fail(result.getError())
    }

    const selfNotificationPayloadOrError = NotificationPayload.create({
      sharedVaultUuid: sharedVault.uuid,
      type: NotificationType.create(NotificationType.TYPES.SelfRemovedFromSharedVault).getValue(),
      version: '1.0',
    })
    if (selfNotificationPayloadOrError.isFailed()) {
      return Result.fail(selfNotificationPayloadOrError.getError())
    }
    const selfNotificationPayload = selfNotificationPayloadOrError.getValue()

    const selfResult = await this.addNotificationForUser.execute({
      userUuid: userUuid.value,
      type: NotificationType.TYPES.SelfRemovedFromSharedVault,
      payload: selfNotificationPayload,
      version: '1.0',
    })
    if (selfResult.isFailed()) {
      return Result.fail(selfResult.getError())
    }

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createUserRemovedFromSharedVaultEvent({
        sharedVaultUuid: dto.sharedVaultUuid,
        userUuid: dto.userUuid,
      }),
    )

    return Result.ok()
  }
}

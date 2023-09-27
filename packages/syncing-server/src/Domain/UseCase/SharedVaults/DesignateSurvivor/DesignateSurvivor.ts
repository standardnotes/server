import { TimerInterface } from '@standardnotes/time'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import {
  NotificationPayload,
  NotificationPayloadIdentifierType,
  NotificationType,
  Result,
  SharedVaultUser,
  SharedVaultUserPermission,
  Timestamps,
  UseCaseInterface,
  Uuid,
} from '@standardnotes/domain-core'

import { SharedVaultUserRepositoryInterface } from '../../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { DesignateSurvivorDTO } from './DesignateSurvivorDTO'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'
import { SharedVaultRepositoryInterface } from '../../../SharedVault/SharedVaultRepositoryInterface'
import { AddNotificationForUser } from '../../Messaging/AddNotificationForUser/AddNotificationForUser'

export class DesignateSurvivor implements UseCaseInterface<void> {
  constructor(
    private sharedVaultRepository: SharedVaultRepositoryInterface,
    private sharedVaultUserRepository: SharedVaultUserRepositoryInterface,
    private timer: TimerInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
    private addNotificationForUser: AddNotificationForUser,
  ) {}

  async execute(dto: DesignateSurvivorDTO): Promise<Result<void>> {
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

    const originatorUuidOrError = Uuid.create(dto.originatorUuid)
    if (originatorUuidOrError.isFailed()) {
      return Result.fail(originatorUuidOrError.getError())
    }
    const originatorUuid = originatorUuidOrError.getValue()

    const sharedVault = await this.sharedVaultRepository.findByUuid(sharedVaultUuid)
    if (!sharedVault) {
      return Result.fail('Shared vault not found')
    }

    const sharedVaultUsers = await this.sharedVaultUserRepository.findBySharedVaultUuid(sharedVaultUuid)
    let sharedVaultExistingSurvivor: SharedVaultUser | undefined
    let toBeDesignatedAsASurvivor: SharedVaultUser | undefined
    let isOriginatorTheOwner = false
    for (const sharedVaultUser of sharedVaultUsers) {
      if (sharedVaultUser.props.userUuid.equals(userUuid)) {
        toBeDesignatedAsASurvivor = sharedVaultUser
      }
      if (sharedVaultUser.props.isDesignatedSurvivor) {
        sharedVaultExistingSurvivor = sharedVaultUser
      }
      if (
        sharedVaultUser.props.userUuid.equals(originatorUuid) &&
        sharedVaultUser.props.permission.value === SharedVaultUserPermission.PERMISSIONS.Admin
      ) {
        isOriginatorTheOwner = true
      }
    }

    if (!isOriginatorTheOwner) {
      return Result.fail('Only the owner can designate a survivor')
    }

    if (!toBeDesignatedAsASurvivor) {
      return Result.fail('Attempting to designate a survivor for a non-member')
    }

    if (sharedVaultExistingSurvivor) {
      sharedVaultExistingSurvivor.props.isDesignatedSurvivor = false
      sharedVaultExistingSurvivor.props.timestamps = Timestamps.create(
        sharedVaultExistingSurvivor.props.timestamps.createdAt,
        this.timer.getTimestampInMicroseconds(),
      ).getValue()
      await this.sharedVaultUserRepository.save(sharedVaultExistingSurvivor)
    }

    toBeDesignatedAsASurvivor.props.isDesignatedSurvivor = true
    toBeDesignatedAsASurvivor.props.timestamps = Timestamps.create(
      toBeDesignatedAsASurvivor.props.timestamps.createdAt,
      this.timer.getTimestampInMicroseconds(),
    ).getValue()

    await this.sharedVaultUserRepository.save(toBeDesignatedAsASurvivor)

    sharedVault.props.timestamps = Timestamps.create(
      sharedVault.props.timestamps.createdAt,
      this.timer.getTimestampInMicroseconds(),
    ).getValue()

    await this.sharedVaultRepository.save(sharedVault)

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createUserDesignatedAsSurvivorInSharedVaultEvent({
        sharedVaultUuid: sharedVaultUuid.value,
        userUuid: userUuid.value,
        timestamp: this.timer.getTimestampInMicroseconds(),
      }),
    )

    const notificationPayloadOrError = NotificationPayload.create({
      primaryIdentifier: sharedVault.uuid,
      primaryIndentifierType: NotificationPayloadIdentifierType.create(
        NotificationPayloadIdentifierType.TYPES.SharedVaultUuid,
      ).getValue(),
      secondaryIdentifier: userUuid,
      secondaryIdentifierType: NotificationPayloadIdentifierType.create(
        NotificationPayloadIdentifierType.TYPES.UserUuid,
      ).getValue(),
      type: NotificationType.create(NotificationType.TYPES.UserDesignatedAsSurvivor).getValue(),
      version: '1.0',
    })
    if (notificationPayloadOrError.isFailed()) {
      return Result.fail(notificationPayloadOrError.getError())
    }
    const notificationPayload = notificationPayloadOrError.getValue()

    const result = await this.addNotificationForUser.execute({
      userUuid: sharedVault.props.userUuid.value,
      type: NotificationType.TYPES.UserDesignatedAsSurvivor,
      payload: notificationPayload,
      version: '1.0',
    })
    if (result.isFailed()) {
      return Result.fail(result.getError())
    }

    return Result.ok()
  }
}

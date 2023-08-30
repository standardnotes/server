import { NotificationType, Result, Timestamps, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

import { AddNotificationForUserDTO } from './AddNotificationForUserDTO'
import { NotificationRepositoryInterface } from '../../../Notifications/NotificationRepositoryInterface'
import { Notification } from '../../../Notifications/Notification'
import { SendEventToClient } from '../../Syncing/SendEventToClient/SendEventToClient'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'
import { Logger } from 'winston'

export class AddNotificationForUser implements UseCaseInterface<Notification> {
  constructor(
    private notificationRepository: NotificationRepositoryInterface,
    private timer: TimerInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private sendEventToClientUseCase: SendEventToClient,
    private logger: Logger,
  ) {}

  async execute(dto: AddNotificationForUserDTO): Promise<Result<Notification>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const typeOrError = NotificationType.create(dto.type)
    if (typeOrError.isFailed()) {
      return Result.fail(typeOrError.getError())
    }
    const type = typeOrError.getValue()

    const notificationOrError = Notification.create({
      userUuid,
      type,
      payload: dto.payload,
      timestamps: Timestamps.create(
        this.timer.getTimestampInMicroseconds(),
        this.timer.getTimestampInMicroseconds(),
      ).getValue(),
    })
    if (notificationOrError.isFailed()) {
      return Result.fail(notificationOrError.getError())
    }
    const notification = notificationOrError.getValue()

    await this.notificationRepository.save(notification)

    const event = this.domainEventFactory.createNotificationAddedForUserEvent({
      uuid: notification.id.toString(),
      userUuid: notification.props.userUuid.value,
      type: notification.props.type.value,
      payload: notification.props.payload.toString(),
      createdAtTimestamp: notification.props.timestamps.createdAt,
      updatedAtTimestamp: notification.props.timestamps.updatedAt,
    })

    const result = await this.sendEventToClientUseCase.execute({
      userUuid: userUuid.value,
      event,
    })
    if (result.isFailed()) {
      this.logger.error(
        `Failed to send notification added event to client for user ${userUuid.value}: ${result.getError()}`,
      )
    }

    return Result.ok(notification)
  }
}

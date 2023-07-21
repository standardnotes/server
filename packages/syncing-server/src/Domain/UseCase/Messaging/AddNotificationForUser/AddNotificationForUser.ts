import { NotificationType, Result, Timestamps, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

import { AddNotificationForUserDTO } from './AddNotificationForUserDTO'
import { NotificationRepositoryInterface } from '../../../Notifications/NotificationRepositoryInterface'
import { Notification } from '../../../Notifications/Notification'

export class AddNotificationForUser implements UseCaseInterface<Notification> {
  constructor(private notificationRepository: NotificationRepositoryInterface, private timer: TimerInterface) {}

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

    return Result.ok(notification)
  }
}

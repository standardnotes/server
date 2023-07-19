import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { Notification } from '../../../Notifications/Notification'
import { GetUserNotificationsDTO } from './GetUserNotificationsDTO'
import { NotificationRepositoryInterface } from '../../../Notifications/NotificationRepositoryInterface'

export class GetUserNotifications implements UseCaseInterface<Notification[]> {
  constructor(private notificationRepository: NotificationRepositoryInterface) {}

  async execute(dto: GetUserNotificationsDTO): Promise<Result<Notification[]>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    if (dto.lastSyncTime) {
      return Result.ok(await this.notificationRepository.findByUserUuidUpdatedAfter(userUuid, dto.lastSyncTime))
    }

    return Result.ok(await this.notificationRepository.findByUserUuid(userUuid))
  }
}

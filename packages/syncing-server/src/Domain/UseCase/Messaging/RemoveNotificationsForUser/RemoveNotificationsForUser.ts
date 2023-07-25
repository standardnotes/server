import { NotificationType, Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { RemoveNotificationsForUserDTO } from './RemoveNotificationsForUserDTO'
import { NotificationRepositoryInterface } from '../../../Notifications/NotificationRepositoryInterface'

export class RemoveNotificationsForUser implements UseCaseInterface<void> {
  constructor(private notificationRepository: NotificationRepositoryInterface) {}

  async execute(dto: RemoveNotificationsForUserDTO): Promise<Result<void>> {
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

    const notifications = await this.notificationRepository.findByUserUuidAndType(userUuid, type)
    for (const notification of notifications) {
      await this.notificationRepository.remove(notification)
    }

    return Result.ok()
  }
}

import {
  Timestamps,
  MapperInterface,
  UniqueEntityId,
  Uuid,
  NotificationType,
  NotificationPayload,
} from '@standardnotes/domain-core'

import { Notification } from '../../Domain/Notifications/Notification'

import { TypeORMNotification } from '../../Infra/TypeORM/TypeORMNotification'

export class NotificationPersistenceMapper implements MapperInterface<Notification, TypeORMNotification> {
  toDomain(projection: TypeORMNotification): Notification {
    const userUuidOrError = Uuid.create(projection.userUuid)
    if (userUuidOrError.isFailed()) {
      throw new Error(`Failed to create notification from projection: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const timestampsOrError = Timestamps.create(projection.createdAtTimestamp, projection.updatedAtTimestamp)
    if (timestampsOrError.isFailed()) {
      throw new Error(`Failed to create notification from projection: ${timestampsOrError.getError()}`)
    }
    const timestamps = timestampsOrError.getValue()

    const typeOrError = NotificationType.create(projection.type)
    if (typeOrError.isFailed()) {
      throw new Error(`Failed to create notification from projection: ${typeOrError.getError()}`)
    }
    const type = typeOrError.getValue()

    const payloadOrError = NotificationPayload.createFromString(projection.payload)
    if (payloadOrError.isFailed()) {
      throw new Error(`Failed to create notification from projection: ${payloadOrError.getError()}`)
    }
    const payload = payloadOrError.getValue()

    const notificationOrError = Notification.create(
      {
        userUuid,
        payload,
        type,
        timestamps,
      },
      new UniqueEntityId(projection.uuid),
    )
    if (notificationOrError.isFailed()) {
      throw new Error(`Failed to create notification from projection: ${notificationOrError.getError()}`)
    }
    const notification = notificationOrError.getValue()

    return notification
  }

  toProjection(domain: Notification): TypeORMNotification {
    const typeorm = new TypeORMNotification()

    typeorm.uuid = domain.id.toString()
    typeorm.userUuid = domain.props.userUuid.value
    typeorm.payload = domain.props.payload.toString()
    typeorm.type = domain.props.type.value
    typeorm.createdAtTimestamp = domain.props.timestamps.createdAt
    typeorm.updatedAtTimestamp = domain.props.timestamps.updatedAt

    return typeorm
  }
}

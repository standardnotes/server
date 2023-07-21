import { MapperInterface } from '@standardnotes/domain-core'

import { Notification } from '../../Domain/Notifications/Notification'
import { NotificationHttpRepresentation } from './NotificationHttpRepresentation'

export class NotificationHttpMapper implements MapperInterface<Notification, NotificationHttpRepresentation> {
  toDomain(_projection: NotificationHttpRepresentation): Notification {
    throw new Error('Mapping from http representation to domain is not implemented.')
  }

  toProjection(domain: Notification): NotificationHttpRepresentation {
    return {
      uuid: domain.id.toString(),
      user_uuid: domain.props.userUuid.value,
      type: domain.props.type.value,
      payload: domain.props.payload.toString(),
      created_at_timestamp: domain.props.timestamps.createdAt,
      updated_at_timestamp: domain.props.timestamps.updatedAt,
    }
  }
}

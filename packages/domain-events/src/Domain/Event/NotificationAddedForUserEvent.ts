import { DomainEventInterface } from './DomainEventInterface'

import { NotificationAddedForUserEventPayload } from './NotificationAddedForUserEventPayload'

export interface NotificationAddedForUserEvent extends DomainEventInterface {
  type: 'NOTIFICATION_ADDED_FOR_USER'
  payload: NotificationAddedForUserEventPayload
}

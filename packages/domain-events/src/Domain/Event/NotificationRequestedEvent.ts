import { DomainEventInterface } from './DomainEventInterface'
import { NotificationRequestedEventPayload } from './NotificationRequestedEventPayload'

export interface NotificationRequestedEvent extends DomainEventInterface {
  type: 'NOTIFICATION_REQUESTED'
  payload: NotificationRequestedEventPayload
}

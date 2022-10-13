import { DomainEventInterface } from './DomainEventInterface'
import { WebSocketMessageRequestedEventPayload } from './WebSocketMessageRequestedEventPayload'

export interface WebSocketMessageRequestedEvent extends DomainEventInterface {
  type: 'WEB_SOCKET_MESSAGE_REQUESTED'
  payload: WebSocketMessageRequestedEventPayload
}

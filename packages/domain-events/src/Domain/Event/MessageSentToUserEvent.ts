import { DomainEventInterface } from './DomainEventInterface'

import { MessageSentToUserEventPayload } from './MessageSentToUserEventPayload'

export interface MessageSentToUserEvent extends DomainEventInterface {
  type: 'MESSAGE_SENT_TO_USER'
  payload: MessageSentToUserEventPayload
}

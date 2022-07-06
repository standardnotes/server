import { DomainEventInterface } from './DomainEventInterface'
import { ListedAccountRequestedEventPayload } from './ListedAccountRequestedEventPayload'

export interface ListedAccountRequestedEvent extends DomainEventInterface {
  type: 'LISTED_ACCOUNT_REQUESTED'
  payload: ListedAccountRequestedEventPayload
}

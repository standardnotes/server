import { DomainEventInterface } from './DomainEventInterface'
import { ListedAccountCreatedEventPayload } from './ListedAccountCreatedEventPayload'

export interface ListedAccountCreatedEvent extends DomainEventInterface {
  type: 'LISTED_ACCOUNT_CREATED'
  payload: ListedAccountCreatedEventPayload
}

import { DomainEventInterface } from './DomainEventInterface'
import { ListedAccountDeletedEventPayload } from './ListedAccountDeletedEventPayload'

export interface ListedAccountDeletedEvent extends DomainEventInterface {
  type: 'LISTED_ACCOUNT_DELETED'
  payload: ListedAccountDeletedEventPayload
}

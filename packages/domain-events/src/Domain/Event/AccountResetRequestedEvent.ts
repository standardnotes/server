import { DomainEventInterface } from './DomainEventInterface'

import { AccountResetRequestedEventPayload } from './AccountResetRequestedEventPayload'

export interface AccountResetRequestedEvent extends DomainEventInterface {
  type: 'ACCOUNT_RESET_REQUESTED'
  payload: AccountResetRequestedEventPayload
}

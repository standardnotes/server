import { DomainEventInterface } from './DomainEventInterface'

import { StatisticPersistenceRequestedEventPayload } from './StatisticPersistenceRequestedEventPayload'

export interface StatisticPersistenceRequestedEvent extends DomainEventInterface {
  type: 'STATISTIC_PERSISTENCE_REQUESTED'
  payload: StatisticPersistenceRequestedEventPayload
}

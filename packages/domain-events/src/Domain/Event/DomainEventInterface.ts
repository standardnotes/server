import { DomainEventService } from './DomainEventService'

export interface DomainEventInterface {
  type: string
  createdAt: Date
  payload: unknown
  meta: {
    correlation: {
      userIdentifier: string
      userIdentifierType: 'uuid' | 'email' | 'shared-vault-uuid'
    }
    trace?: Record<string, string>
    origin: DomainEventService
    target?: DomainEventService
  }
}

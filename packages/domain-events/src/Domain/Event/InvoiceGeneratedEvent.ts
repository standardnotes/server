import { DomainEventInterface } from './DomainEventInterface'

import { InvoiceGeneratedEventPayload } from './InvoiceGeneratedEventPayload'

export interface InvoiceGeneratedEvent extends DomainEventInterface {
  type: 'INVOICE_GENERATED'
  payload: InvoiceGeneratedEventPayload
}

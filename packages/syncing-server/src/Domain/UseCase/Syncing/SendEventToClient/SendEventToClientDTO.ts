import { DomainEventInterface } from '@standardnotes/domain-events'

export interface SendEventToClientDTO {
  userUuid: string
  event: DomainEventInterface
}

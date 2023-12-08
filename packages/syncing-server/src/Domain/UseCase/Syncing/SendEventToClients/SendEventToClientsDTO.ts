import { DomainEventInterface } from '@standardnotes/domain-events'

export interface SendEventToClientsDTO {
  sharedVaultUuid: string
  event: DomainEventInterface
  originatingUserUuid: string
}

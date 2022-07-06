import { DomainEventInterface } from './DomainEventInterface'
import { ActivationCodeRequestedEventPayload } from './ActivationCodeRequestedEventPayload'

export interface ActivationCodeRequestedEvent extends DomainEventInterface {
  type: 'ACTIVATION_CODE_REQUESTED'
  payload: ActivationCodeRequestedEventPayload
}

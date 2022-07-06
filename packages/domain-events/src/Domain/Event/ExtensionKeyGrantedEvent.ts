import { DomainEventInterface } from './DomainEventInterface'

import { ExtensionKeyGrantedEventPayload } from './ExtensionKeyGrantedEventPayload'

export interface ExtensionKeyGrantedEvent extends DomainEventInterface {
  type: 'EXTENSION_KEY_GRANTED'
  payload: ExtensionKeyGrantedEventPayload
}

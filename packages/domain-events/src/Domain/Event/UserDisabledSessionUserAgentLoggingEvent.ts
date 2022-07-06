import { DomainEventInterface } from './DomainEventInterface'
import { UserDisabledSessionUserAgentLoggingEventPayload } from './UserDisabledSessionUserAgentLoggingEventPayload'

export interface UserDisabledSessionUserAgentLoggingEvent extends DomainEventInterface {
  type: 'USER_DISABLED_SESSION_USER_AGENT_LOGGING'
  payload: UserDisabledSessionUserAgentLoggingEventPayload
}

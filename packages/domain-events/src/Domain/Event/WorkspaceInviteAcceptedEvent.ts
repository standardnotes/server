import { DomainEventInterface } from './DomainEventInterface'
import { WorkspaceInviteAcceptedEventPayload } from './WorkspaceInviteAcceptedEventPayload'

export interface WorkspaceInviteAcceptedEvent extends DomainEventInterface {
  type: 'WORKSPACE_INVITE_ACCEPTED'
  payload: WorkspaceInviteAcceptedEventPayload
}

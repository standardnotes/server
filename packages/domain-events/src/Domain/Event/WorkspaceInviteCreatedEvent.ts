import { DomainEventInterface } from './DomainEventInterface'
import { WorkspaceInviteCreatedEventPayload } from './WorkspaceInviteCreatedEventPayload'

export interface WorkspaceInviteCreatedEvent extends DomainEventInterface {
  type: 'WORKSPACE_INVITE_CREATED'
  payload: WorkspaceInviteCreatedEventPayload
}

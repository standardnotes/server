import { WorkspaceInviteCreatedEvent } from '@standardnotes/domain-events'

export interface DomainEventFactoryInterface {
  createWorkspaceInviteCreatedEvent(dto: {
    inviterUuid: string
    inviteeEmail: string
    inviteUuid: string
    workspaceUuid: string
  }): WorkspaceInviteCreatedEvent
}

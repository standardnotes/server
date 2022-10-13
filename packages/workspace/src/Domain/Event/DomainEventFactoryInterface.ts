import { JSONString } from '@standardnotes/common'
import {
  WebSocketMessageRequestedEvent,
  WorkspaceInviteAcceptedEvent,
  WorkspaceInviteCreatedEvent,
} from '@standardnotes/domain-events'

export interface DomainEventFactoryInterface {
  createWorkspaceInviteCreatedEvent(dto: {
    inviterUuid: string
    inviteeEmail: string
    inviteUuid: string
    workspaceUuid: string
  }): WorkspaceInviteCreatedEvent
  createWorkspaceInviteAcceptedEvent(dto: {
    inviterUuid: string
    inviteeUuid: string
    workspaceUuid: string
  }): WorkspaceInviteAcceptedEvent
  createWebSocketMessageRequestedEvent(dto: { userUuid: string; message: JSONString }): WebSocketMessageRequestedEvent
}

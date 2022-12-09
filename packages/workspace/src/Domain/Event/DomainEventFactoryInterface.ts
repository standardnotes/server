import { JSONString } from '@standardnotes/common'
import {
  EmailRequestedEvent,
  WebSocketMessageRequestedEvent,
  WorkspaceInviteAcceptedEvent,
} from '@standardnotes/domain-events'

export interface DomainEventFactoryInterface {
  createEmailRequestedEvent(dto: {
    userEmail: string
    messageIdentifier: string
    level: string
    body: string
    subject: string
  }): EmailRequestedEvent
  createWorkspaceInviteAcceptedEvent(dto: {
    inviterUuid: string
    inviteeUuid: string
    workspaceUuid: string
  }): WorkspaceInviteAcceptedEvent
  createWebSocketMessageRequestedEvent(dto: { userUuid: string; message: JSONString }): WebSocketMessageRequestedEvent
}

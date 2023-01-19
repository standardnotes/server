import { WorkspaceAccessLevel } from '@standardnotes/common'

export type InviteToWorkspaceDTO = {
  workspaceUuid: string
  inviterUuid: string
  inviteeEmail: string
  accessLevel: WorkspaceAccessLevel
}

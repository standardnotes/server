import { Uuid, WorkspaceAccessLevel } from '@standardnotes/common'

export type InviteToWorkspaceDTO = {
  workspaceUuid: Uuid
  inviterUuid: Uuid
  inviteeEmail: string
  accessLevel: WorkspaceAccessLevel
}

import { Uuid } from '@standardnotes/common'

export type InviteToWorkspaceDTO = {
  workspaceUuid: Uuid
  inviterUuid: Uuid
  inviteeEmail: string
}

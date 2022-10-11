import { WorkspaceUser } from '../../Workspace/WorkspaceUser'

export type ListWorkspaceUsersResponse = {
  workspaceUsers: WorkspaceUser[]
  userIsOwnerOrAdmin: boolean
}

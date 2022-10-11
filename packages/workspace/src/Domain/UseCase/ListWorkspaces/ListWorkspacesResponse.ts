import { Workspace } from '../../Workspace/Workspace'

export type ListWorkspacesResponse = {
  ownedWorkspaces: Array<Workspace>
  joinedWorkspaces: Array<Workspace>
}

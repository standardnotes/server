import { inject, injectable } from 'inversify'
import {
  HttpStatusCode,
  WorkspaceCreationRequestParams,
  WorkspaceCreationResponse,
  WorkspaceInvitationRequestParams,
  WorkspaceInvitationResponse,
  WorkspaceServerInterface,
  WorkspaceListRequestParams,
  WorkspaceListResponse,
  WorkspaceInvitationAcceptingRequestParams,
  WorkspaceInvitationAcceptingResponse,
  WorkspaceUserListRequestParams,
  WorkspaceKeyshareInitiatingRequestParams,
  WorkspaceKeyshareInitiatingResponse,
} from '@standardnotes/api'
import { Uuid, WorkspaceAccessLevel, WorkspaceType } from '@standardnotes/common'

import TYPES from '../Bootstrap/Types'
import { CreateWorkspace } from '../Domain/UseCase/CreateWorkspace/CreateWorkspace'
import { InviteToWorkspace } from '../Domain/UseCase/InviteToWorkspace/InviteToWorkspace'
import { ProjectorInterface } from '../Domain/Projection/ProjectorInterface'
import { WorkspaceProjection } from '../Domain/Projection/WorkspaceProjection'
import { Workspace } from '../Domain/Workspace/Workspace'
import { ListWorkspaces } from '../Domain/UseCase/ListWorkspaces/ListWorkspaces'
import { WorkspaceUserListResponse } from '@standardnotes/api/dist/Domain/Response/Workspace/WorkspaceUserListResponse'
import { AcceptInvitation } from '../Domain/UseCase/AcceptInvitation/AcceptInvitation'
import { WorkspaceUser } from '../Domain/Workspace/WorkspaceUser'
import { WorkspaceUserProjection } from '../Domain/Projection/WorkspaceUserProjection'
import { ListWorkspaceUsers } from '../Domain/UseCase/ListWorkspaceUsers/ListWorkspaceUsers'
import { InitiateKeyShare } from '../Domain/UseCase/InitiateKeyShare/InitiateKeyShare'

@injectable()
export class WorkspacesController implements WorkspaceServerInterface {
  constructor(
    @inject(TYPES.CreateWorkspace) private doCreateWorkspace: CreateWorkspace,
    @inject(TYPES.InviteToWorkspace) private doInviteToWorkspace: InviteToWorkspace,
    @inject(TYPES.ListWorkspaces) private doListWorkspaces: ListWorkspaces,
    @inject(TYPES.ListWorkspaceUsers) private doListWorkspaceUsers: ListWorkspaceUsers,
    @inject(TYPES.AcceptInvitation) private doAcceptInvite: AcceptInvitation,
    @inject(TYPES.InitiateKeyShare) private doInitiateKeyshare: InitiateKeyShare,
    @inject(TYPES.WorkspaceProjector) private workspaceProjector: ProjectorInterface<Workspace, WorkspaceProjection>,
    @inject(TYPES.WorkspaceUserProjector)
    private workspaceUserProjector: ProjectorInterface<WorkspaceUser, WorkspaceUserProjection>,
  ) {}

  async initiateKeyshare(
    params: WorkspaceKeyshareInitiatingRequestParams,
  ): Promise<WorkspaceKeyshareInitiatingResponse> {
    const result = await this.doInitiateKeyshare.execute({
      userUuid: params.userUuid,
      workspaceUuid: params.workspaceUuid,
      encryptedWorkspaceKey: params.encryptedWorkspaceKey,
      performingUserUuid: params.performingUserUuid as Uuid,
    })

    if (!result.success) {
      return {
        status: HttpStatusCode.BadRequest,
        data: {
          error: {
            message: 'Could not initiate keyshare.',
          },
        },
      }
    }

    return {
      status: HttpStatusCode.Success,
      data: {
        success: true,
      },
    }
  }

  async inviteToWorkspace(params: WorkspaceInvitationRequestParams): Promise<WorkspaceInvitationResponse> {
    const { invite } = await this.doInviteToWorkspace.execute({
      inviteeEmail: params.inviteeEmail,
      workspaceUuid: params.workspaceUuid,
      inviterUuid: params.inviterUuid as Uuid,
      accessLevel: params.accessLevel as WorkspaceAccessLevel,
    })

    return {
      status: HttpStatusCode.Success,
      data: { uuid: invite.uuid },
    }
  }

  async createWorkspace(params: WorkspaceCreationRequestParams): Promise<WorkspaceCreationResponse> {
    const { workspace } = await this.doCreateWorkspace.execute({
      encryptedPrivateKey: params.encryptedPrivateKey,
      encryptedWorkspaceKey: params.encryptedWorkspaceKey,
      publicKey: params.publicKey,
      name: params.workspaceName,
      type: WorkspaceType.Root,
      ownerUuid: params.ownerUuid as string,
    })

    return {
      status: HttpStatusCode.Success,
      data: { uuid: workspace.uuid },
    }
  }

  async listWorkspaces(params: WorkspaceListRequestParams): Promise<WorkspaceListResponse> {
    const { ownedWorkspaces, joinedWorkspaces } = await this.doListWorkspaces.execute({
      userUuid: params.userUuid as Uuid,
    })

    const ownedWorkspacesProjections = []
    for (const ownedWorkspace of ownedWorkspaces) {
      ownedWorkspacesProjections.push(await this.workspaceProjector.project(ownedWorkspace))
    }

    const joinedWorkspacesProjections = []
    for (const joinedWorkspace of joinedWorkspaces) {
      joinedWorkspacesProjections.push(await this.workspaceProjector.project(joinedWorkspace))
    }

    return {
      status: HttpStatusCode.Success,
      data: { ownedWorkspaces: ownedWorkspacesProjections, joinedWorkspaces: joinedWorkspacesProjections },
    }
  }

  async listWorkspaceUsers(params: WorkspaceUserListRequestParams): Promise<WorkspaceUserListResponse> {
    const { workspaceUsers } = await this.doListWorkspaceUsers.execute({
      userUuid: params.userUuid as Uuid,
      workspaceUuid: params.workspaceUuid,
    })

    const workspaceUserProjections = []
    for (const workspaceUser of workspaceUsers) {
      workspaceUserProjections.push(await this.workspaceUserProjector.project(workspaceUser))
    }

    return {
      status: HttpStatusCode.Success,
      data: { users: workspaceUserProjections },
    }
  }

  async acceptInvite(params: WorkspaceInvitationAcceptingRequestParams): Promise<WorkspaceInvitationAcceptingResponse> {
    const result = await this.doAcceptInvite.execute({
      acceptingUserUuid: params.userUuid,
      encryptedPrivateKey: params.encryptedPrivateKey,
      invitationUuid: params.inviteUuid,
      publicKey: params.publicKey,
    })

    if (!result.success) {
      return {
        status: HttpStatusCode.BadRequest,
        data: {
          error: {
            message: 'Could not accept invite',
          },
        },
      }
    }

    return {
      status: HttpStatusCode.Success,
      data: {
        success: true,
      },
    }
  }
}

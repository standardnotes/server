import { inject, injectable } from 'inversify'
import {
  HttpStatusCode,
  WorkspaceCreationRequestParams,
  WorkspaceCreationResponse,
  WorkspaceInvitationRequestParams,
  WorkspaceInvitationResponse,
  WorkspaceServerInterface,
} from '@standardnotes/api'
import { Uuid, WorkspaceAccessLevel, WorkspaceType } from '@standardnotes/common'

import TYPES from '../Bootstrap/Types'
import { CreateWorkspace } from '../Domain/UseCase/CreateWorkspace/CreateWorkspace'
import { InviteToWorkspace } from '../Domain/UseCase/InviteToWorkspace/InviteToWorkspace'

@injectable()
export class WorkspacesController implements WorkspaceServerInterface {
  constructor(
    @inject(TYPES.CreateWorkspace) private doCreateWorkspace: CreateWorkspace,
    @inject(TYPES.InviteToWorkspace) private doInviteToWorkspace: InviteToWorkspace,
  ) {}

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
}

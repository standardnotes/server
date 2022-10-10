import { inject, injectable } from 'inversify'
import {
  HttpStatusCode,
  WorkspaceCreationRequestParams,
  WorkspaceCreationResponse,
  WorkspaceServerInterface,
} from '@standardnotes/api'
import { WorkspaceType } from '@standardnotes/common'

import TYPES from '../Bootstrap/Types'
import { CreateWorkspace } from '../Domain/UseCase/CreateWorkspace/CreateWorkspace'

@injectable()
export class WorkspacesController implements WorkspaceServerInterface {
  constructor(@inject(TYPES.CreateWorkspace) private doCreateWorkspace: CreateWorkspace) {}

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

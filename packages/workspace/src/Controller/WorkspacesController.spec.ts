import { WorkspaceAccessLevel, WorkspaceType } from '@standardnotes/common'
import 'reflect-metadata'

import { CreateWorkspace } from '../Domain/UseCase/CreateWorkspace/CreateWorkspace'
import { InviteToWorkspace } from '../Domain/UseCase/InviteToWorkspace/InviteToWorkspace'

import { WorkspacesController } from './WorkspacesController'

describe('WorkspacesController', () => {
  let doCreateWorkspace: CreateWorkspace
  let doInviteToWorkspace: InviteToWorkspace

  const createController = () => new WorkspacesController(doCreateWorkspace, doInviteToWorkspace)

  beforeEach(() => {
    doCreateWorkspace = {} as jest.Mocked<CreateWorkspace>
    doCreateWorkspace.execute = jest.fn().mockReturnValue({ workspace: { uuid: 'w-1-2-3' } })

    doInviteToWorkspace = {} as jest.Mocked<InviteToWorkspace>
    doInviteToWorkspace.execute = jest.fn().mockReturnValue({ invite: { uuid: 'i-1-2-3' } })
  })

  it('should create a workspace', async () => {
    const result = await createController().createWorkspace({
      encryptedPrivateKey: 'foo',
      encryptedWorkspaceKey: 'bar',
      publicKey: 'buzz',
      workspaceName: 'A Team',
      ownerUuid: 'u-1-2-3',
      workspaceType: WorkspaceType.Private,
    })

    expect(result).toEqual({
      data: {
        uuid: 'w-1-2-3',
      },
      status: 200,
    })
  })

  it('should invite to a workspace', async () => {
    const result = await createController().inviteToWorkspace({
      inviteeEmail: 'test@test.te',
      workspaceUuid: 'w-1-2-3',
      accessLevel: WorkspaceAccessLevel.ReadOnly,
    })

    expect(result).toEqual({
      data: {
        uuid: 'i-1-2-3',
      },
      status: 200,
    })
  })
})

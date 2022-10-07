import 'reflect-metadata'

import { CreateWorkspace } from '../Domain/UseCase/CreateWorkspace/CreateWorkspace'

import { WorkspacesController } from './WorkspacesController'

describe('WorkspacesController', () => {
  let doCreateWorkspace: CreateWorkspace

  const createController = () => new WorkspacesController(doCreateWorkspace)

  beforeEach(() => {
    doCreateWorkspace = {} as jest.Mocked<CreateWorkspace>
    doCreateWorkspace.execute = jest.fn().mockReturnValue({ workspace: { uuid: 'w-1-2-3' } })
  })

  it('should create a workspace', async () => {
    const result = await createController().createWorkspace({
      encryptedPrivateKey: 'foo',
      encryptedWorkspaceKey: 'bar',
      publicKey: 'buzz',
      workspaceName: 'A Team',
      ownerUuid: 'u-1-2-3',
    })

    expect(result).toEqual({
      data: {
        uuid: 'w-1-2-3',
      },
      status: 200,
    })
  })
})

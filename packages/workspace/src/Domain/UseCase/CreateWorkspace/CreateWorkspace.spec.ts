import 'reflect-metadata'

import { WorkspaceType } from '@standardnotes/common'

import { WorkspaceRepositoryInterface } from '../../Workspace/WorkspaceRepositoryInterface'
import { WorkspaceUserRepositoryInterface } from '../../Workspace/WorkspaceUserRepositoryInterface'

import { CreateWorkspace } from './CreateWorkspace'
import { TimerInterface } from '@standardnotes/time'

describe('CreateWorkspace', () => {
  let workspaceRepository: WorkspaceRepositoryInterface
  let workspaceUserRepository: WorkspaceUserRepositoryInterface
  let timer: TimerInterface

  const createUseCase = () => new CreateWorkspace(workspaceRepository, workspaceUserRepository, timer)

  beforeEach(() => {
    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(1)

    workspaceRepository = {} as jest.Mocked<WorkspaceRepositoryInterface>
    workspaceRepository.save = jest.fn().mockImplementation((workspace) => {
      return {
        ...workspace,
        uuid: 'w-1-2-3',
      }
    })

    workspaceUserRepository = {} as jest.Mocked<WorkspaceUserRepositoryInterface>
    workspaceUserRepository.save = jest.fn()
  })

  it('should create a workspace and owner association with it', async () => {
    await createUseCase().execute({
      encryptedPrivateKey: 'foo',
      encryptedWorkspaceKey: 'bar',
      publicKey: 'buzz',
      name: 'A Team',
      ownerUuid: '1-2-3',
      type: WorkspaceType.Root,
    })

    expect(workspaceRepository.save).toHaveBeenCalledWith({
      name: 'A Team',
      type: 'root',
      createdAt: 1,
      updatedAt: 1,
    })
    expect(workspaceUserRepository.save).toHaveBeenCalledWith({
      accessLevel: 'owner',
      encryptedWorkspaceKey: 'bar',
      encryptedPrivateKey: 'foo',
      publicKey: 'buzz',
      status: 'active',
      userUuid: '1-2-3',
      workspaceUuid: 'w-1-2-3',
      createdAt: 1,
      updatedAt: 1,
    })
  })

  it('should create a workspace without optional parameters', async () => {
    await createUseCase().execute({
      ownerUuid: '1-2-3',
      type: WorkspaceType.Private,
    })

    expect(workspaceRepository.save).toHaveBeenCalledWith({
      type: 'private',
      createdAt: 1,
      updatedAt: 1,
    })
    expect(workspaceUserRepository.save).toHaveBeenCalledWith({
      accessLevel: 'owner',
      status: 'active',
      userUuid: '1-2-3',
      workspaceUuid: 'w-1-2-3',
      createdAt: 1,
      updatedAt: 1,
    })
  })
})

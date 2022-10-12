import 'reflect-metadata'

import { TimerInterface } from '@standardnotes/time'

import { WorkspaceUser } from '../../Workspace/WorkspaceUser'
import { WorkspaceUserRepositoryInterface } from '../../Workspace/WorkspaceUserRepositoryInterface'

import { InitiateKeyShare } from './InitiateKeyShare'

describe('InitiateKeyShare', () => {
  let workspaceUserRepository: WorkspaceUserRepositoryInterface
  let timer: TimerInterface
  let workspaceUser: WorkspaceUser

  const createUseCase = () => new InitiateKeyShare(workspaceUserRepository, timer)

  beforeEach(() => {
    workspaceUser = {} as jest.Mocked<WorkspaceUser>

    workspaceUserRepository = {} as jest.Mocked<WorkspaceUserRepositoryInterface>
    workspaceUserRepository.findOneByUserUuidAndWorkspaceUuid = jest.fn().mockReturnValue(workspaceUser)
    workspaceUserRepository.save = jest.fn().mockImplementation((user: WorkspaceUser) => user)

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(1)
  })

  it('should update the workspace user with a workspace key and mark as active', async () => {
    await createUseCase().execute({
      workspaceUuid: 'w-1-2-3',
      userUuid: 'u-1-2-3',
      encryptedWorkspaceKey: 'foobar',
    })

    expect(workspaceUserRepository.save).toHaveBeenCalledWith({
      encryptedWorkspaceKey: 'foobar',
      status: 'active',
      updatedAt: 1,
    })
  })

  it('should not initiate key share if workspace is not found', async () => {
    workspaceUserRepository.findOneByUserUuidAndWorkspaceUuid = jest.fn().mockReturnValue(null)

    await createUseCase().execute({
      workspaceUuid: 'w-1-2-3',
      userUuid: 'u-1-2-3',
      encryptedWorkspaceKey: 'foobar',
    })

    expect(workspaceUserRepository.save).not.toHaveBeenCalled()
  })
})

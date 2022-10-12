import 'reflect-metadata'

import { TimerInterface } from '@standardnotes/time'

import { WorkspaceUser } from '../../Workspace/WorkspaceUser'
import { WorkspaceUserRepositoryInterface } from '../../Workspace/WorkspaceUserRepositoryInterface'

import { InitiateKeyShare } from './InitiateKeyShare'
import { WorkspaceAccessLevel } from '@standardnotes/common'

describe('InitiateKeyShare', () => {
  let workspaceUserRepository: WorkspaceUserRepositoryInterface
  let timer: TimerInterface
  let workspaceUser: WorkspaceUser
  let workspaceOwner: WorkspaceUser

  const createUseCase = () => new InitiateKeyShare(workspaceUserRepository, timer)

  beforeEach(() => {
    workspaceOwner = {
      accessLevel: WorkspaceAccessLevel.Owner,
    } as jest.Mocked<WorkspaceUser>
    workspaceUser = {} as jest.Mocked<WorkspaceUser>

    workspaceUserRepository = {} as jest.Mocked<WorkspaceUserRepositoryInterface>
    workspaceUserRepository.findOneByUserUuidAndWorkspaceUuid = jest
      .fn()
      .mockReturnValueOnce(workspaceOwner)
      .mockReturnValueOnce(workspaceUser)
    workspaceUserRepository.save = jest.fn().mockImplementation((user: WorkspaceUser) => user)

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(1)
  })

  it('should update the workspace user with a workspace key and mark as active', async () => {
    await createUseCase().execute({
      workspaceUuid: 'w-1-2-3',
      userUuid: 'u-1-2-3',
      encryptedWorkspaceKey: 'foobar',
      performingUserUuid: 'o-1-2-3',
    })

    expect(workspaceUserRepository.save).toHaveBeenCalledWith({
      encryptedWorkspaceKey: 'foobar',
      status: 'active',
      updatedAt: 1,
    })
  })

  it('should not initiate key share if workspace is not found', async () => {
    workspaceUserRepository.findOneByUserUuidAndWorkspaceUuid = jest
      .fn()
      .mockReturnValueOnce(workspaceOwner)
      .mockReturnValueOnce(null)

    await createUseCase().execute({
      workspaceUuid: 'w-1-2-3',
      userUuid: 'u-1-2-3',
      encryptedWorkspaceKey: 'foobar',
      performingUserUuid: 'o-1-2-3',
    })

    expect(workspaceUserRepository.save).not.toHaveBeenCalled()
  })

  it('should not initiate key share if workspace performing user is not the owner or admin', async () => {
    workspaceOwner.accessLevel = WorkspaceAccessLevel.ReadOnly
    workspaceUserRepository.findOneByUserUuidAndWorkspaceUuid = jest
      .fn()
      .mockReturnValueOnce(workspaceOwner)
      .mockReturnValueOnce(workspaceUser)

    await createUseCase().execute({
      workspaceUuid: 'w-1-2-3',
      userUuid: 'u-1-2-3',
      encryptedWorkspaceKey: 'foobar',
      performingUserUuid: 'o-1-2-3',
    })

    expect(workspaceUserRepository.save).not.toHaveBeenCalled()
  })

  it('should not initiate key share if workspace performing user is found in workspace', async () => {
    workspaceOwner.accessLevel = WorkspaceAccessLevel.ReadOnly
    workspaceUserRepository.findOneByUserUuidAndWorkspaceUuid = jest
      .fn()
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(workspaceUser)

    await createUseCase().execute({
      workspaceUuid: 'w-1-2-3',
      userUuid: 'u-1-2-3',
      encryptedWorkspaceKey: 'foobar',
      performingUserUuid: 'o-1-2-3',
    })

    expect(workspaceUserRepository.save).not.toHaveBeenCalled()
  })
})

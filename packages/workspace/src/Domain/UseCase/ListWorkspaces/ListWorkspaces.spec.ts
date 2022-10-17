import { WorkspaceAccessLevel } from '@standardnotes/common'
import 'reflect-metadata'
import { Logger } from 'winston'
import { Workspace } from '../../Workspace/Workspace'
import { WorkspaceRepositoryInterface } from '../../Workspace/WorkspaceRepositoryInterface'
import { WorkspaceUser } from '../../Workspace/WorkspaceUser'
import { WorkspaceUserRepositoryInterface } from '../../Workspace/WorkspaceUserRepositoryInterface'

import { ListWorkspaces } from './ListWorkspaces'

describe('ListWorkspaces', () => {
  let workspaceRepository: WorkspaceRepositoryInterface
  let workspaceUserRepository: WorkspaceUserRepositoryInterface
  let ownedWorkspace: Workspace
  let joinedWorkspace: Workspace
  let workspaceUser1: WorkspaceUser
  let workspaceUser2: WorkspaceUser
  let logger: Logger

  const createUseCase = () => new ListWorkspaces(workspaceRepository, workspaceUserRepository, logger)

  beforeEach(() => {
    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()

    ownedWorkspace = { uuid: 'o-1-2-3' } as jest.Mocked<Workspace>
    joinedWorkspace = { uuid: 'j-1-2-3' } as jest.Mocked<Workspace>

    workspaceUser1 = { accessLevel: WorkspaceAccessLevel.Owner } as jest.Mocked<WorkspaceUser>
    workspaceUser2 = { accessLevel: WorkspaceAccessLevel.WriteAndRead } as jest.Mocked<WorkspaceUser>

    workspaceRepository = {} as jest.Mocked<WorkspaceRepositoryInterface>
    workspaceRepository.findByUuids = jest
      .fn()
      .mockReturnValueOnce([ownedWorkspace])
      .mockReturnValueOnce([joinedWorkspace])

    workspaceUserRepository = {} as jest.Mocked<WorkspaceUserRepositoryInterface>
    workspaceUserRepository.findByUserUuid = jest.fn().mockReturnValue([workspaceUser1, workspaceUser2])
  })

  it('should list owned and joined workspaces for a user', async () => {
    const result = await createUseCase().execute({
      userUuid: 'u-1-2-3',
    })

    expect(result).toEqual({
      ownedWorkspaces: [ownedWorkspace],
      joinedWorkspaces: [joinedWorkspace],
    })
  })

  it('should list empty owned and joined workspaces for a user that does not have any', async () => {
    workspaceUserRepository.findByUserUuid = jest.fn().mockReturnValue([])

    const result = await createUseCase().execute({
      userUuid: 'u-1-2-3',
    })

    expect(result).toEqual({
      ownedWorkspaces: [],
      joinedWorkspaces: [],
    })
  })
})

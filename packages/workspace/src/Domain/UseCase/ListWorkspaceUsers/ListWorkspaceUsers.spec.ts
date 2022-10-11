import { WorkspaceAccessLevel } from '@standardnotes/common'
import 'reflect-metadata'
import { Workspace } from '../../Workspace/Workspace'
import { WorkspaceRepositoryInterface } from '../../Workspace/WorkspaceRepositoryInterface'
import { WorkspaceUser } from '../../Workspace/WorkspaceUser'
import { WorkspaceUserRepositoryInterface } from '../../Workspace/WorkspaceUserRepositoryInterface'

import { ListWorkspaceUsers } from './ListWorkspaceUsers'

describe('ListWorkspaceUsers', () => {
  let workspaceRepository: WorkspaceRepositoryInterface
  let workspaceUserRepository: WorkspaceUserRepositoryInterface
  let workspace: Workspace
  let workspaceUser1: WorkspaceUser
  let workspaceUser2: WorkspaceUser

  const createUseCase = () => new ListWorkspaceUsers(workspaceRepository, workspaceUserRepository)

  beforeEach(() => {
    workspace = { uuid: 'j-1-2-3' } as jest.Mocked<Workspace>

    workspaceUser1 = { userUuid: 'u-1-2-3', accessLevel: WorkspaceAccessLevel.Owner } as jest.Mocked<WorkspaceUser>
    workspaceUser2 = {
      userUuid: 'u-2-3-4',
      accessLevel: WorkspaceAccessLevel.WriteAndRead,
    } as jest.Mocked<WorkspaceUser>

    workspaceRepository = {} as jest.Mocked<WorkspaceRepositoryInterface>
    workspaceRepository.findOneByUuid = jest.fn().mockReturnValue(workspace)

    workspaceUserRepository = {} as jest.Mocked<WorkspaceUserRepositoryInterface>
    workspaceUserRepository.findByWorkspaceUuid = jest.fn().mockReturnValue([workspaceUser1, workspaceUser2])
  })

  it('should list users in a workspace where the user is owner or admin', async () => {
    const result = await createUseCase().execute({
      userUuid: 'u-1-2-3',
      workspaceUuid: 'j-1-2-3',
    })

    expect(result).toEqual({
      workspaceUsers: [workspaceUser1, workspaceUser2],
      userIsOwnerOrAdmin: true,
    })
  })

  it('should list users in a workspace where the user is not the owner or admin with indiciation', async () => {
    const result = await createUseCase().execute({
      userUuid: 'u-2-3-4',
      workspaceUuid: 'j-1-2-3',
    })

    expect(result).toEqual({
      workspaceUsers: [workspaceUser1, workspaceUser2],
      userIsOwnerOrAdmin: false,
    })
  })

  it('should not list users in a workspace where the user does not belong', async () => {
    const result = await createUseCase().execute({
      userUuid: 'z-1-2-3',
      workspaceUuid: 'j-1-2-3',
    })

    expect(result).toEqual({
      workspaceUsers: [],
      userIsOwnerOrAdmin: false,
    })
  })

  it('should not list users in a workspace that does not exist', async () => {
    workspaceRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    const result = await createUseCase().execute({
      userUuid: 'u-1-2-3',
      workspaceUuid: 'j-1-2-3',
    })

    expect(result).toEqual({
      workspaceUsers: [],
      userIsOwnerOrAdmin: false,
    })
  })
})

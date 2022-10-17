import 'reflect-metadata'
import { WorkspaceAccessLevel, WorkspaceType } from '@standardnotes/common'

import { ProjectorInterface } from '../Domain/Projection/ProjectorInterface'
import { WorkspaceProjection } from '../Domain/Projection/WorkspaceProjection'
import { WorkspaceUserProjection } from '../Domain/Projection/WorkspaceUserProjection'
import { AcceptInvitation } from '../Domain/UseCase/AcceptInvitation/AcceptInvitation'

import { CreateWorkspace } from '../Domain/UseCase/CreateWorkspace/CreateWorkspace'
import { InitiateKeyShare } from '../Domain/UseCase/InitiateKeyShare/InitiateKeyShare'
import { InviteToWorkspace } from '../Domain/UseCase/InviteToWorkspace/InviteToWorkspace'
import { ListWorkspaces } from '../Domain/UseCase/ListWorkspaces/ListWorkspaces'
import { ListWorkspaceUsers } from '../Domain/UseCase/ListWorkspaceUsers/ListWorkspaceUsers'
import { Workspace } from '../Domain/Workspace/Workspace'
import { WorkspaceUser } from '../Domain/Workspace/WorkspaceUser'

import { WorkspacesController } from './WorkspacesController'

describe('WorkspacesController', () => {
  let doCreateWorkspace: CreateWorkspace
  let doInviteToWorkspace: InviteToWorkspace
  let doAcceptInvitation: AcceptInvitation
  let doListWorkspaces: ListWorkspaces
  let doListWorkspaceUsers: ListWorkspaceUsers
  let doInitiateKeyshare: InitiateKeyShare
  let workspacesProject: ProjectorInterface<Workspace, WorkspaceProjection>
  let workspaceUsersProjector: ProjectorInterface<WorkspaceUser, WorkspaceUserProjection>
  let workspace1: Workspace
  let workspace2: Workspace
  let workspaceUser1: WorkspaceUser
  let workspaceUser2: WorkspaceUser

  const createController = () =>
    new WorkspacesController(
      doCreateWorkspace,
      doInviteToWorkspace,
      doListWorkspaces,
      doListWorkspaceUsers,
      doAcceptInvitation,
      doInitiateKeyshare,
      workspacesProject,
      workspaceUsersProjector,
    )

  beforeEach(() => {
    doCreateWorkspace = {} as jest.Mocked<CreateWorkspace>
    doCreateWorkspace.execute = jest.fn().mockReturnValue({ workspace: { uuid: 'w-1-2-3' } })

    doInviteToWorkspace = {} as jest.Mocked<InviteToWorkspace>
    doInviteToWorkspace.execute = jest.fn().mockReturnValue({ invite: { uuid: 'i-1-2-3' } })

    doListWorkspaces = {} as jest.Mocked<ListWorkspaces>
    doListWorkspaces.execute = jest
      .fn()
      .mockReturnValue({ ownedWorkspaces: [workspace1], joinedWorkspaces: [workspace2] })

    doListWorkspaceUsers = {} as jest.Mocked<ListWorkspaceUsers>
    doListWorkspaceUsers.execute = jest.fn().mockReturnValue({ workspaceUsers: [workspaceUser1, workspaceUser2] })

    doAcceptInvitation = {} as jest.Mocked<AcceptInvitation>
    doAcceptInvitation.execute = jest.fn().mockReturnValue({ success: true })

    doInitiateKeyshare = {} as jest.Mocked<InitiateKeyShare>
    doInitiateKeyshare.execute = jest.fn().mockReturnValue({ success: true })

    workspacesProject = {} as jest.Mocked<ProjectorInterface<Workspace, WorkspaceProjection>>
    workspacesProject.project = jest.fn().mockReturnValue({ foo: 'bar' })

    workspaceUsersProjector = {} as jest.Mocked<ProjectorInterface<WorkspaceUser, WorkspaceUserProjection>>
    workspaceUsersProjector.project = jest.fn().mockReturnValue({ bar: 'buzz' })
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

  it('should accept an invite', async () => {
    const result = await createController().acceptInvite({
      userUuid: '1-2-3',
      encryptedPrivateKey: 'foo',
      inviteUuid: 'i-1-2-3',
      publicKey: 'bar',
    })

    expect(result).toEqual({
      data: {
        success: true,
      },
      status: 200,
    })
  })

  it('should not accept an invite if it fails', async () => {
    doAcceptInvitation.execute = jest.fn().mockReturnValue({ success: false })
    const result = await createController().acceptInvite({
      userUuid: '1-2-3',
      encryptedPrivateKey: 'foo',
      inviteUuid: 'i-1-2-3',
      publicKey: 'bar',
    })

    expect(result).toEqual({
      data: {
        error: {
          message: 'Could not accept invite',
        },
      },
      status: 400,
    })
  })

  it('should list workspaces', async () => {
    const result = await createController().listWorkspaces({
      userUuid: '1-2-3',
    })

    expect(result).toEqual({
      data: {
        ownedWorkspaces: [{ foo: 'bar' }],
        joinedWorkspaces: [{ foo: 'bar' }],
      },
      status: 200,
    })
  })

  it('should list workspace users', async () => {
    const result = await createController().listWorkspaceUsers({
      userUuid: '1-2-3',
      workspaceUuid: 'w-1-2-3',
    })

    expect(result).toEqual({
      data: {
        users: [{ bar: 'buzz' }, { bar: 'buzz' }],
      },
      status: 200,
    })
  })

  it('should initiate keyshare', async () => {
    const result = await createController().initiateKeyshare({
      userUuid: 'u-1-2-3',
      encryptedWorkspaceKey: 'foo',
      workspaceUuid: 'w-1-2-3',
      performingUserUuid: 'p-1-2-3',
    })

    expect(result).toEqual({
      data: {
        success: true,
      },
      status: 200,
    })
  })

  it('should not initiate keyshare if it fails', async () => {
    doInitiateKeyshare.execute = jest.fn().mockReturnValue({ success: false })

    const result = await createController().initiateKeyshare({
      userUuid: 'u-1-2-3',
      encryptedWorkspaceKey: 'foo',
      workspaceUuid: 'w-1-2-3',
      performingUserUuid: 'p-1-2-3',
    })

    expect(result).toEqual({
      data: {
        error: {
          message: 'Could not initiate keyshare.',
        },
      },
      status: 400,
    })
  })
})

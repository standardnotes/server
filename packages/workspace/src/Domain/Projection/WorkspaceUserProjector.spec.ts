import 'reflect-metadata'

import { WorkspaceAccessLevel, WorkspaceUserStatus } from '@standardnotes/common'
import { WorkspaceUser } from '../Workspace/WorkspaceUser'

import { WorkspaceUserProjector } from './WorkspaceUserProjector'

describe('WorkspaceUserProjector', () => {
  const createProjector = () => new WorkspaceUserProjector()

  it('should project a workspace user', async () => {
    expect(
      await createProjector().project({
        uuid: '1-2-3',
        accessLevel: WorkspaceAccessLevel.Owner,
        userUuid: 'u-1-2-3',
        userDisplayName: 'foobar',
        workspaceUuid: 'w-1-2-3',
        encryptedWorkspaceKey: 'foo',
        publicKey: 'bar',
        encryptedPrivateKey: 'buzz',
        status: WorkspaceUserStatus.PendingKeyshare,
        keyRotationIndex: 0,
        createdAt: 1,
        updatedAt: 2,
      } as jest.Mocked<WorkspaceUser>),
    ).toEqual({
      uuid: '1-2-3',
      accessLevel: 'owner',
      userUuid: 'u-1-2-3',
      userDisplayName: 'foobar',
      workspaceUuid: 'w-1-2-3',
      encryptedWorkspaceKey: 'foo',
      publicKey: 'bar',
      encryptedPrivateKey: 'buzz',
      status: 'pending-keyshare',
      keyRotationIndex: 0,
      createdAt: 1,
      updatedAt: 2,
    })
  })
})

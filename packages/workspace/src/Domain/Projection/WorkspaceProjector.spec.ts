import 'reflect-metadata'

import { WorkspaceType } from '@standardnotes/common'
import { Workspace } from '../Workspace/Workspace'

import { WorkspaceProjector } from './WorkspaceProjector'

describe('WorkspaceProjector', () => {
  const createProjector = () => new WorkspaceProjector()

  it('should project a workspace', async () => {
    expect(
      await createProjector().project({
        uuid: 'w-1-2-3',
        type: WorkspaceType.Private,
        name: 'test',
        keyRotationIndex: 0,
        createdAt: 1,
        updatedAt: 2,
      } as jest.Mocked<Workspace>),
    ).toEqual({
      uuid: 'w-1-2-3',
      type: 'private',
      name: 'test',
      keyRotationIndex: 0,
      createdAt: 1,
      updatedAt: 2,
    })
  })
})

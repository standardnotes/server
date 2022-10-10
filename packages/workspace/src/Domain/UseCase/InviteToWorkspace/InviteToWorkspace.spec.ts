import 'reflect-metadata'
import { TimerInterface } from '@standardnotes/time'

import { WorkspaceInviteRepositoryInterface } from '../../Invite/WorkspaceInviteRepositoryInterface'

import { InviteToWorkspace } from './InviteToWorkspace'

describe('InviteToWorkspace', () => {
  let workspaceInviteRepository: WorkspaceInviteRepositoryInterface
  let timer: TimerInterface

  const createUseCase = () => new InviteToWorkspace(workspaceInviteRepository, timer)

  beforeEach(() => {
    workspaceInviteRepository = {} as jest.Mocked<WorkspaceInviteRepositoryInterface>
    workspaceInviteRepository.save = jest.fn().mockImplementation((invite) => {
      return {
        ...invite,
        uuid: 'i-1-2-3',
      }
    })

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(1)
  })

  it('should create an invite', async () => {
    const result = await createUseCase().execute({
      inviteeEmail: 'test@test.te',
      inviterUuid: 'u-1-2-3',
      workspaceUuid: 'w-1-2-3',
    })

    expect(result).toEqual({ uuid: 'i-1-2-3' })

    expect(workspaceInviteRepository.save).toHaveBeenCalledWith({
      inviterUuid: 'u-1-2-3',
      inviteeEmail: 'test@test.te',
      workspaceUuid: 'w-1-2-3',
      status: 'created',
      createdAt: 1,
      updatedAt: 1,
    })
  })
})

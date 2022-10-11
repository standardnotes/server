import 'reflect-metadata'
import { TimerInterface } from '@standardnotes/time'

import { WorkspaceInvite } from '../../Invite/WorkspaceInvite'
import { WorkspaceInviteRepositoryInterface } from '../../Invite/WorkspaceInviteRepositoryInterface'
import { WorkspaceUserRepositoryInterface } from '../../Workspace/WorkspaceUserRepositoryInterface'

import { AcceptInvitation } from './AcceptInvitation'
import { WorkspaceAccessLevel } from '@standardnotes/common'

describe('AcceptInvitation', () => {
  let workspaceInviteRepository: WorkspaceInviteRepositoryInterface
  let workspaceUserRepository: WorkspaceUserRepositoryInterface
  let timer: TimerInterface
  let invite: WorkspaceInvite

  const createUseCase = () => new AcceptInvitation(workspaceInviteRepository, workspaceUserRepository, timer)

  beforeEach(() => {
    invite = {
      uuid: 'i-1-2-3',
      workspaceUuid: 'w-1-2-3',
      inviteeEmail: 'test@test.te',
      accessLevel: WorkspaceAccessLevel.WriteAndRead,
    } as jest.Mocked<WorkspaceInvite>
    workspaceInviteRepository = {} as jest.Mocked<WorkspaceInviteRepositoryInterface>
    workspaceInviteRepository.findOneByUuid = jest.fn().mockReturnValue(invite)
    workspaceInviteRepository.save = jest.fn()

    workspaceUserRepository = {} as jest.Mocked<WorkspaceUserRepositoryInterface>
    workspaceUserRepository.save = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(1)
  })

  it('should accept an invite and assign user to workspace', async () => {
    await createUseCase().execute({
      acceptingUserUuid: 'u-1-2-3',
      encryptedPrivateKey: 'foo',
      publicKey: 'bar',
      invitationUuid: 'i-1-2-3',
    })

    expect(workspaceInviteRepository.save).toHaveBeenCalledWith({
      acceptingUserUuid: 'u-1-2-3',
      status: 'accepted',
      updatedAt: 1,
      uuid: 'i-1-2-3',
      workspaceUuid: 'w-1-2-3',
      inviteeEmail: 'test@test.te',
      accessLevel: 'write-and-read',
    })
    expect(workspaceUserRepository.save).toHaveBeenCalledWith({
      encryptedPrivateKey: 'foo',
      publicKey: 'bar',
      status: 'pending-keyshare',
      userUuid: 'u-1-2-3',
      workspaceUuid: 'w-1-2-3',
      accessLevel: 'write-and-read',
      userDisplayName: 'test@test.te',
    })
  })

  it('should not accept an invite if it does not exist', async () => {
    workspaceInviteRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    await createUseCase().execute({
      acceptingUserUuid: 'u-1-2-3',
      encryptedPrivateKey: 'foo',
      publicKey: 'bar',
      invitationUuid: 'i-1-2-3',
    })

    expect(workspaceInviteRepository.save).not.toHaveBeenCalled()
    expect(workspaceUserRepository.save).not.toHaveBeenCalled()
  })
})

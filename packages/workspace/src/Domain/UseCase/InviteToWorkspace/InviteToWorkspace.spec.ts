import 'reflect-metadata'
import { TimerInterface } from '@standardnotes/time'

import { WorkspaceInviteRepositoryInterface } from '../../Invite/WorkspaceInviteRepositoryInterface'

import { InviteToWorkspace } from './InviteToWorkspace'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { DomainEventPublisherInterface, WorkspaceInviteCreatedEvent } from '@standardnotes/domain-events'
import { WorkspaceAccessLevel } from '@standardnotes/common'

describe('InviteToWorkspace', () => {
  let workspaceInviteRepository: WorkspaceInviteRepositoryInterface
  let timer: TimerInterface
  let domainEventFactory: DomainEventFactoryInterface
  let domainEventPublisher: DomainEventPublisherInterface

  const createUseCase = () =>
    new InviteToWorkspace(workspaceInviteRepository, timer, domainEventFactory, domainEventPublisher)

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

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createWorkspaceInviteCreatedEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<WorkspaceInviteCreatedEvent>)
  })

  it('should create an invite', async () => {
    const result = await createUseCase().execute({
      inviteeEmail: 'test@test.te',
      inviterUuid: 'u-1-2-3',
      workspaceUuid: 'w-1-2-3',
      accessLevel: WorkspaceAccessLevel.WriteAndRead,
    })

    expect(result).toEqual({
      invite: {
        uuid: 'i-1-2-3',
        inviterUuid: 'u-1-2-3',
        inviteeEmail: 'test@test.te',
        workspaceUuid: 'w-1-2-3',
        status: 'created',
        accessLevel: 'write-and-read',
        createdAt: 1,
        updatedAt: 1,
      },
    })

    expect(workspaceInviteRepository.save).toHaveBeenCalledWith({
      accessLevel: 'write-and-read',
      inviterUuid: 'u-1-2-3',
      inviteeEmail: 'test@test.te',
      workspaceUuid: 'w-1-2-3',
      status: 'created',
      createdAt: 1,
      updatedAt: 1,
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })
})

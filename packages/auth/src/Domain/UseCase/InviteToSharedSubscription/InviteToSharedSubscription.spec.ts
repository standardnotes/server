import 'reflect-metadata'

import {
  DomainEventPublisherInterface,
  SharedSubscriptionInvitationCreatedEvent,
  EmailRequestedEvent,
} from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { SharedSubscriptionInvitationRepositoryInterface } from '../../SharedSubscription/SharedSubscriptionInvitationRepositoryInterface'

import { InviteToSharedSubscription } from './InviteToSharedSubscription'
import { UserSubscriptionRepositoryInterface } from '../../Subscription/UserSubscriptionRepositoryInterface'
import { UserSubscription } from '../../Subscription/UserSubscription'
import { RoleName } from '@standardnotes/domain-core'
import { UserSubscriptionType } from '../../Subscription/UserSubscriptionType'
import { SharedSubscriptionInvitation } from '../../SharedSubscription/SharedSubscriptionInvitation'
import { InvitationStatus } from '../../SharedSubscription/InvitationStatus'

describe('InviteToSharedSubscription', () => {
  let userSubscriptionRepository: UserSubscriptionRepositoryInterface
  let timer: TimerInterface
  let sharedSubscriptionInvitationRepository: SharedSubscriptionInvitationRepositoryInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface

  const createUseCase = () =>
    new InviteToSharedSubscription(
      userSubscriptionRepository,
      timer,
      sharedSubscriptionInvitationRepository,
      domainEventPublisher,
      domainEventFactory,
    )

  beforeEach(() => {
    userSubscriptionRepository = {} as jest.Mocked<UserSubscriptionRepositoryInterface>
    userSubscriptionRepository.findOneByUserUuid = jest.fn().mockReturnValue({
      subscriptionId: 2,
      subscriptionType: UserSubscriptionType.Regular,
    } as jest.Mocked<UserSubscription>)

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(1)

    sharedSubscriptionInvitationRepository = {} as jest.Mocked<SharedSubscriptionInvitationRepositoryInterface>
    sharedSubscriptionInvitationRepository.save = jest.fn().mockImplementation((same) => ({ ...same, uuid: '1-2-3' }))
    sharedSubscriptionInvitationRepository.countByInviterEmailAndStatus = jest.fn().mockReturnValue(2)
    sharedSubscriptionInvitationRepository.findOneByInviteeAndInviterEmail = jest.fn().mockReturnValue(null)

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createSharedSubscriptionInvitationCreatedEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<SharedSubscriptionInvitationCreatedEvent>)
    domainEventFactory.createEmailRequestedEvent = jest.fn().mockReturnValue({} as jest.Mocked<EmailRequestedEvent>)
  })

  it('should not create an inivitation for sharing the subscription if inviter has no subscription', async () => {
    userSubscriptionRepository.findOneByUserUuid = jest.fn().mockReturnValue(null)

    await createUseCase().execute({
      inviteeIdentifier: 'invitee@test.te',
      inviterUuid: '1-2-3',
      inviterEmail: 'inviter@test.te',
      inviterRoles: [RoleName.NAMES.ProUser],
    })

    expect(sharedSubscriptionInvitationRepository.save).not.toHaveBeenCalled()

    expect(domainEventFactory.createSharedSubscriptionInvitationCreatedEvent).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should not create an inivitation if user is not a pro user', async () => {
    expect(
      await createUseCase().execute({
        inviteeIdentifier: 'invitee@test.te',
        inviterUuid: '1-2-3',
        inviterEmail: 'inviter@test.te',
        inviterRoles: [RoleName.NAMES.PlusUser],
      }),
    ).toEqual({
      success: false,
    })

    expect(sharedSubscriptionInvitationRepository.save).not.toHaveBeenCalled()

    expect(domainEventFactory.createSharedSubscriptionInvitationCreatedEvent).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should not create an inivitation if user is already reached the max limit of invites', async () => {
    sharedSubscriptionInvitationRepository.countByInviterEmailAndStatus = jest.fn().mockReturnValue(5)

    expect(
      await createUseCase().execute({
        inviteeIdentifier: 'invitee@test.te',
        inviterUuid: '1-2-3',
        inviterEmail: 'inviter@test.te',
        inviterRoles: [RoleName.NAMES.ProUser],
      }),
    ).toEqual({
      success: false,
    })

    expect(sharedSubscriptionInvitationRepository.save).not.toHaveBeenCalled()

    expect(domainEventFactory.createSharedSubscriptionInvitationCreatedEvent).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should create an inivitation for sharing the subscription', async () => {
    await createUseCase().execute({
      inviteeIdentifier: 'invitee@test.te',
      inviterUuid: '1-2-3',
      inviterEmail: 'inviter@test.te',
      inviterRoles: [RoleName.NAMES.ProUser],
    })

    expect(sharedSubscriptionInvitationRepository.save).toHaveBeenCalledWith({
      createdAt: 1,
      inviteeIdentifier: 'invitee@test.te',
      inviteeIdentifierType: 'email',
      inviterIdentifier: 'inviter@test.te',
      inviterIdentifierType: 'email',
      status: 'sent',
      subscriptionId: 2,
      updatedAt: 1,
    })

    expect(domainEventFactory.createSharedSubscriptionInvitationCreatedEvent).toHaveBeenCalledWith({
      inviteeIdentifier: 'invitee@test.te',
      inviteeIdentifierType: 'email',
      inviterEmail: 'inviter@test.te',
      inviterSubscriptionId: 2,
      sharedSubscriptionInvitationUuid: '1-2-3',
    })
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should create an inivitation for sharing the subscription with a vault account', async () => {
    await createUseCase().execute({
      inviteeIdentifier: 'a75a31ce95365904ef0e0a8e6cefc1f5e99adfef81bbdb6d4499eeb10ae0ff67',
      inviterEmail: 'inviter@test.te',
      inviterUuid: '1-2-3',
      inviterRoles: [RoleName.NAMES.ProUser],
    })

    expect(sharedSubscriptionInvitationRepository.save).toHaveBeenCalledWith({
      createdAt: 1,
      inviteeIdentifier: 'a75a31ce95365904ef0e0a8e6cefc1f5e99adfef81bbdb6d4499eeb10ae0ff67',
      inviteeIdentifierType: 'hash',
      inviterIdentifier: 'inviter@test.te',
      inviterIdentifierType: 'email',
      status: 'sent',
      subscriptionId: 2,
      updatedAt: 1,
    })

    expect(domainEventFactory.createSharedSubscriptionInvitationCreatedEvent).toHaveBeenCalledWith({
      inviteeIdentifier: 'a75a31ce95365904ef0e0a8e6cefc1f5e99adfef81bbdb6d4499eeb10ae0ff67',
      inviteeIdentifierType: 'hash',
      inviterEmail: 'inviter@test.te',
      inviterSubscriptionId: 2,
      sharedSubscriptionInvitationUuid: '1-2-3',
    })
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should not create an inivitation for sharing the subscription if the inviter is on a shared subscription', async () => {
    userSubscriptionRepository.findOneByUserUuid = jest.fn().mockReturnValue({
      subscriptionId: 2,
      subscriptionType: UserSubscriptionType.Shared,
    } as jest.Mocked<UserSubscription>)

    await createUseCase().execute({
      inviteeIdentifier: 'invitee@test.te',
      inviterUuid: '1-2-3',
      inviterEmail: 'inviter@test.te',
      inviterRoles: [RoleName.NAMES.ProUser],
    })

    expect(sharedSubscriptionInvitationRepository.save).not.toHaveBeenCalled()

    expect(domainEventFactory.createSharedSubscriptionInvitationCreatedEvent).not.toHaveBeenCalled()

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should not create an invitation if it already exists', async () => {
    sharedSubscriptionInvitationRepository.findOneByInviteeAndInviterEmail = jest
      .fn()
      .mockReturnValue({ status: InvitationStatus.Sent } as jest.Mocked<SharedSubscriptionInvitation>)

    expect(
      await createUseCase().execute({
        inviteeIdentifier: 'invitee@test.te',
        inviterUuid: '1-2-3',
        inviterEmail: 'inviter@test.te',
        inviterRoles: [RoleName.NAMES.ProUser],
      }),
    ).toEqual({
      success: false,
    })

    expect(sharedSubscriptionInvitationRepository.save).not.toHaveBeenCalled()

    expect(domainEventFactory.createSharedSubscriptionInvitationCreatedEvent).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should create an invitation if it already exists but was canceled', async () => {
    sharedSubscriptionInvitationRepository.findOneByInviteeAndInviterEmail = jest
      .fn()
      .mockReturnValue({ status: InvitationStatus.Canceled } as jest.Mocked<SharedSubscriptionInvitation>)

    expect(
      await createUseCase().execute({
        inviteeIdentifier: 'invitee@test.te',
        inviterUuid: '1-2-3',
        inviterEmail: 'inviter@test.te',
        inviterRoles: [RoleName.NAMES.ProUser],
      }),
    ).toEqual({
      success: true,
      sharedSubscriptionInvitationUuid: '1-2-3',
    })

    expect(sharedSubscriptionInvitationRepository.save).toHaveBeenCalled()

    expect(domainEventFactory.createSharedSubscriptionInvitationCreatedEvent).toHaveBeenCalled()
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })
})

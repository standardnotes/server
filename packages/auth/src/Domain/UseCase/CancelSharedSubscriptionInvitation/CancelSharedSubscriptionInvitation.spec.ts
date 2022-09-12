import 'reflect-metadata'

import { RoleName, SubscriptionName } from '@standardnotes/common'
import { TimerInterface } from '@standardnotes/time'

import { RoleServiceInterface } from '../../Role/RoleServiceInterface'
import { SharedSubscriptionInvitation } from '../../SharedSubscription/SharedSubscriptionInvitation'
import { SharedSubscriptionInvitationRepositoryInterface } from '../../SharedSubscription/SharedSubscriptionInvitationRepositoryInterface'
import { UserSubscription } from '../../Subscription/UserSubscription'
import { UserSubscriptionRepositoryInterface } from '../../Subscription/UserSubscriptionRepositoryInterface'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'

import { CancelSharedSubscriptionInvitation } from './CancelSharedSubscriptionInvitation'
import { DomainEventPublisherInterface, SharedSubscriptionInvitationCanceledEvent } from '@standardnotes/domain-events'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { InviterIdentifierType } from '../../SharedSubscription/InviterIdentifierType'
import { InviteeIdentifierType } from '../../SharedSubscription/InviteeIdentifierType'
import { Logger } from 'winston'

describe('CancelSharedSubscriptionInvitation', () => {
  let sharedSubscriptionInvitationRepository: SharedSubscriptionInvitationRepositoryInterface
  let userRepository: UserRepositoryInterface
  let userSubscriptionRepository: UserSubscriptionRepositoryInterface
  let roleService: RoleServiceInterface
  let timer: TimerInterface
  let invitee: User
  let inviterSubscription: UserSubscription
  let invitation: SharedSubscriptionInvitation
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  let logger: Logger

  const createUseCase = () =>
    new CancelSharedSubscriptionInvitation(
      sharedSubscriptionInvitationRepository,
      userRepository,
      userSubscriptionRepository,
      roleService,
      domainEventPublisher,
      domainEventFactory,
      timer,
      logger,
    )

  beforeEach(() => {
    invitee = {
      uuid: '123',
      email: 'test@test.com',
      roles: Promise.resolve([
        {
          name: RoleName.CoreUser,
        },
      ]),
    } as jest.Mocked<User>

    invitation = {
      uuid: '1-2-3',
      subscriptionId: 3,
      inviterIdentifier: 'test@test.te',
      inviterIdentifierType: InviterIdentifierType.Email,
      inviteeIdentifier: 'invitee@test.te',
      inviteeIdentifierType: InviteeIdentifierType.Email,
    } as jest.Mocked<SharedSubscriptionInvitation>

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()

    sharedSubscriptionInvitationRepository = {} as jest.Mocked<SharedSubscriptionInvitationRepositoryInterface>
    sharedSubscriptionInvitationRepository.findOneByUuid = jest.fn().mockReturnValue(invitation)
    sharedSubscriptionInvitationRepository.save = jest.fn()

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByEmail = jest.fn().mockReturnValue(invitee)

    inviterSubscription = { endsAt: 3, planName: SubscriptionName.PlusPlan } as jest.Mocked<UserSubscription>

    userSubscriptionRepository = {} as jest.Mocked<UserSubscriptionRepositoryInterface>
    userSubscriptionRepository.findBySubscriptionIdAndType = jest.fn().mockReturnValue([inviterSubscription])
    userSubscriptionRepository.findOneByUserUuidAndSubscriptionId = jest
      .fn()
      .mockReturnValue({ user: Promise.resolve(invitee) } as jest.Mocked<UserSubscription>)
    userSubscriptionRepository.save = jest.fn()

    roleService = {} as jest.Mocked<RoleServiceInterface>
    roleService.removeUserRole = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(1)

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createSharedSubscriptionInvitationCanceledEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<SharedSubscriptionInvitationCanceledEvent>)
  })

  it('should cancel a shared subscription invitation', async () => {
    expect(
      await createUseCase().execute({
        sharedSubscriptionInvitationUuid: '1-2-3',
        inviterEmail: 'test@test.te',
      }),
    ).toEqual({
      success: true,
    })

    expect(sharedSubscriptionInvitationRepository.save).toHaveBeenCalledWith({
      status: 'canceled',
      subscriptionId: 3,
      updatedAt: 1,
      inviterIdentifier: 'test@test.te',
      uuid: '1-2-3',
      inviterIdentifierType: 'email',
      inviteeIdentifier: 'invitee@test.te',
      inviteeIdentifierType: 'email',
    })
    expect(userSubscriptionRepository.save).toHaveBeenCalledWith({
      endsAt: 1,
      user: Promise.resolve(invitee),
    })
    expect(roleService.removeUserRole).toHaveBeenCalledWith(invitee, 'PLUS_PLAN')
    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createSharedSubscriptionInvitationCanceledEvent).toHaveBeenCalledWith({
      inviteeIdentifier: '123',
      inviteeIdentifierType: 'uuid',
      inviterEmail: 'test@test.te',
      inviterSubscriptionId: 3,
      sharedSubscriptionInvitationUuid: '1-2-3',
    })
  })

  it('should cancel a shared subscription invitation without subscription removal if subscription is not found', async () => {
    userSubscriptionRepository.findOneByUserUuidAndSubscriptionId = jest.fn().mockReturnValue(null)

    expect(
      await createUseCase().execute({
        sharedSubscriptionInvitationUuid: '1-2-3',
        inviterEmail: 'test@test.te',
      }),
    ).toEqual({
      success: true,
    })

    expect(sharedSubscriptionInvitationRepository.save).toHaveBeenCalledWith({
      status: 'canceled',
      subscriptionId: 3,
      updatedAt: 1,
      inviterIdentifier: 'test@test.te',
      uuid: '1-2-3',
      inviterIdentifierType: 'email',
      inviteeIdentifier: 'invitee@test.te',
      inviteeIdentifierType: 'email',
    })
    expect(userSubscriptionRepository.save).not.toHaveBeenCalled()
    expect(roleService.removeUserRole).toHaveBeenCalledWith(invitee, 'PLUS_PLAN')
  })

  it('should not cancel a shared subscription invitation if it is not found', async () => {
    sharedSubscriptionInvitationRepository.findOneByUuid = jest.fn().mockReturnValue(null)
    expect(
      await createUseCase().execute({
        sharedSubscriptionInvitationUuid: '1-2-3',
        inviterEmail: 'test@test.te',
      }),
    ).toEqual({
      success: false,
    })
  })

  it('should not cancel a shared subscription invitation if it belongs to differen inviter', async () => {
    expect(
      await createUseCase().execute({
        sharedSubscriptionInvitationUuid: '1-2-3',
        inviterEmail: 'test2@test.te',
      }),
    ).toEqual({
      success: false,
    })
  })

  it('should cancel a shared subscription invitation without subscription removal if invitee is not found', async () => {
    userRepository.findOneByEmail = jest.fn().mockReturnValue(null)
    expect(
      await createUseCase().execute({
        sharedSubscriptionInvitationUuid: '1-2-3',
        inviterEmail: 'test@test.te',
      }),
    ).toEqual({
      success: true,
    })

    expect(sharedSubscriptionInvitationRepository.save).toHaveBeenCalledWith({
      status: 'canceled',
      subscriptionId: 3,
      updatedAt: 1,
      inviterIdentifier: 'test@test.te',
      uuid: '1-2-3',
      inviterIdentifierType: 'email',
      inviteeIdentifier: 'invitee@test.te',
      inviteeIdentifierType: 'email',
    })
    expect(userSubscriptionRepository.save).not.toHaveBeenCalled()
    expect(roleService.removeUserRole).not.toHaveBeenCalled()
  })

  it('should not cancel a shared subscription invitation if inviter subscription is not found', async () => {
    userSubscriptionRepository.findBySubscriptionIdAndType = jest.fn().mockReturnValue([])
    expect(
      await createUseCase().execute({
        sharedSubscriptionInvitationUuid: '1-2-3',
        inviterEmail: 'test@test.te',
      }),
    ).toEqual({
      success: false,
    })
  })
})

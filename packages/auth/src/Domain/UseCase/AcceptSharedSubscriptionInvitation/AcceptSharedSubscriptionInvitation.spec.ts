import 'reflect-metadata'

import { SubscriptionName } from '@standardnotes/common'
import { Result, RoleName } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

import { RoleServiceInterface } from '../../Role/RoleServiceInterface'
import { SharedSubscriptionInvitation } from '../../SharedSubscription/SharedSubscriptionInvitation'
import { SharedSubscriptionInvitationRepositoryInterface } from '../../SharedSubscription/SharedSubscriptionInvitationRepositoryInterface'
import { UserSubscription } from '../../Subscription/UserSubscription'
import { UserSubscriptionRepositoryInterface } from '../../Subscription/UserSubscriptionRepositoryInterface'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'

import { AcceptSharedSubscriptionInvitation } from './AcceptSharedSubscriptionInvitation'
import { ApplyDefaultSubscriptionSettings } from '../ApplyDefaultSubscriptionSettings/ApplyDefaultSubscriptionSettings'
import { Logger } from 'winston'

describe('AcceptSharedSubscriptionInvitation', () => {
  let sharedSubscriptionInvitationRepository: SharedSubscriptionInvitationRepositoryInterface
  let userRepository: UserRepositoryInterface
  let userSubscriptionRepository: UserSubscriptionRepositoryInterface
  let roleService: RoleServiceInterface
  let applyDefaultSubscriptionSettings: ApplyDefaultSubscriptionSettings
  let timer: TimerInterface
  let invitee: User
  let inviterSubscription: UserSubscription
  let inviteeSubscription: UserSubscription
  let invitation: SharedSubscriptionInvitation
  let logger: Logger

  const createUseCase = () =>
    new AcceptSharedSubscriptionInvitation(
      sharedSubscriptionInvitationRepository,
      userRepository,
      userSubscriptionRepository,
      roleService,
      applyDefaultSubscriptionSettings,
      timer,
      logger,
    )

  beforeEach(() => {
    invitee = {
      uuid: '123',
      email: 'test@test.com',
      roles: Promise.resolve([
        {
          name: RoleName.NAMES.CoreUser,
        },
      ]),
    } as jest.Mocked<User>

    invitation = {
      subscriptionId: 3,
      inviteeIdentifier: 'test@test.te',
    } as jest.Mocked<SharedSubscriptionInvitation>

    sharedSubscriptionInvitationRepository = {} as jest.Mocked<SharedSubscriptionInvitationRepositoryInterface>
    sharedSubscriptionInvitationRepository.findOneByUuidAndStatus = jest.fn().mockReturnValue(invitation)
    sharedSubscriptionInvitationRepository.save = jest.fn()

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(invitee)

    inviteeSubscription = { endsAt: 3, planName: SubscriptionName.PlusPlan } as jest.Mocked<UserSubscription>

    inviterSubscription = { endsAt: 3, planName: SubscriptionName.PlusPlan } as jest.Mocked<UserSubscription>

    userSubscriptionRepository = {} as jest.Mocked<UserSubscriptionRepositoryInterface>
    userSubscriptionRepository.findBySubscriptionIdAndType = jest.fn().mockReturnValue([inviterSubscription])
    userSubscriptionRepository.save = jest.fn().mockReturnValue(inviteeSubscription)

    roleService = {} as jest.Mocked<RoleServiceInterface>
    roleService.addUserRoleBasedOnSubscription = jest.fn()

    applyDefaultSubscriptionSettings = {} as jest.Mocked<ApplyDefaultSubscriptionSettings>
    applyDefaultSubscriptionSettings.execute = jest.fn().mockReturnValue(Result.ok())

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(1)

    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()
  })

  it('should create a shared subscription upon accepting the invitation', async () => {
    expect(
      await createUseCase().execute({
        sharedSubscriptionInvitationUuid: '1-2-3',
      }),
    ).toEqual({
      success: true,
    })

    expect(sharedSubscriptionInvitationRepository.save).toHaveBeenCalledWith({
      status: 'accepted',
      subscriptionId: 3,
      inviteeIdentifier: 'test@test.te',
      updatedAt: 1,
    })
    expect(userSubscriptionRepository.save).toHaveBeenCalledWith({
      cancelled: false,
      createdAt: 1,
      endsAt: 3,
      planName: 'PLUS_PLAN',
      subscriptionId: 3,
      subscriptionType: 'shared',
      updatedAt: 1,
      userUuid: '123',
    })
    expect(roleService.addUserRoleBasedOnSubscription).toHaveBeenCalledWith(invitee, 'PLUS_PLAN')
    expect(applyDefaultSubscriptionSettings.execute).toHaveBeenCalled()
  })

  it('should create a shared subscription upon accepting the invitation if inviter has a second subscription', async () => {
    const inviterSubscription1 = { endsAt: 1, planName: SubscriptionName.PlusPlan } as jest.Mocked<UserSubscription>
    const inviterSubscription2 = { endsAt: 5, planName: SubscriptionName.PlusPlan } as jest.Mocked<UserSubscription>

    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(3)

    userSubscriptionRepository.findBySubscriptionIdAndType = jest
      .fn()
      .mockReturnValue([inviterSubscription1, inviterSubscription2])

    expect(
      await createUseCase().execute({
        sharedSubscriptionInvitationUuid: '1-2-3',
      }),
    ).toEqual({
      success: true,
    })

    expect(sharedSubscriptionInvitationRepository.save).toHaveBeenCalledWith({
      status: 'accepted',
      inviteeIdentifier: 'test@test.te',
      subscriptionId: 3,
      updatedAt: 3,
    })
    expect(userSubscriptionRepository.save).toHaveBeenCalledWith({
      cancelled: false,
      createdAt: 3,
      endsAt: 5,
      planName: 'PLUS_PLAN',
      subscriptionId: 3,
      subscriptionType: 'shared',
      updatedAt: 3,
      userUuid: '123',
    })
    expect(roleService.addUserRoleBasedOnSubscription).toHaveBeenCalledWith(invitee, 'PLUS_PLAN')
    expect(applyDefaultSubscriptionSettings.execute).toHaveBeenCalled()
  })

  it('should not create a shared subscription if invitiation is not found', async () => {
    sharedSubscriptionInvitationRepository.findOneByUuidAndStatus = jest.fn().mockReturnValue(null)
    expect(
      await createUseCase().execute({
        sharedSubscriptionInvitationUuid: '1-2-3',
      }),
    ).toEqual({
      success: false,
      message: 'Could not find the subscription invitation. It may have been already accepted or declined.',
    })

    expect(sharedSubscriptionInvitationRepository.save).not.toHaveBeenCalled()
    expect(userSubscriptionRepository.save).not.toHaveBeenCalled()
    expect(roleService.addUserRoleBasedOnSubscription).not.toHaveBeenCalled()
    expect(applyDefaultSubscriptionSettings.execute).not.toHaveBeenCalled()
  })

  it('should not create a shared subscription if invitee is not found', async () => {
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(null)
    expect(
      await createUseCase().execute({
        sharedSubscriptionInvitationUuid: '1-2-3',
      }),
    ).toEqual({
      success: false,
      message:
        'Could not find the invitee in our user database. Please first register an account before accepting the invitation.',
    })

    expect(sharedSubscriptionInvitationRepository.save).not.toHaveBeenCalled()
    expect(userSubscriptionRepository.save).not.toHaveBeenCalled()
    expect(roleService.addUserRoleBasedOnSubscription).not.toHaveBeenCalled()
    expect(applyDefaultSubscriptionSettings.execute).not.toHaveBeenCalled()
  })

  it('should not create a shared subscription if invitee email is invalid', async () => {
    invitation = {
      subscriptionId: 3,
      inviteeIdentifier: '',
    } as jest.Mocked<SharedSubscriptionInvitation>
    sharedSubscriptionInvitationRepository.findOneByUuidAndStatus = jest.fn().mockReturnValue(invitation)

    expect(
      await createUseCase().execute({
        sharedSubscriptionInvitationUuid: '1-2-3',
      }),
    ).toEqual({
      success: false,
      message: 'Given value is not a valid email address: ',
    })

    expect(sharedSubscriptionInvitationRepository.save).not.toHaveBeenCalled()
    expect(userSubscriptionRepository.save).not.toHaveBeenCalled()
    expect(roleService.addUserRoleBasedOnSubscription).not.toHaveBeenCalled()
    expect(applyDefaultSubscriptionSettings.execute).not.toHaveBeenCalled()
  })

  it('should not create a shared subscription if inviter subscription is not found', async () => {
    userSubscriptionRepository.findBySubscriptionIdAndType = jest.fn().mockReturnValue([])
    expect(
      await createUseCase().execute({
        sharedSubscriptionInvitationUuid: '1-2-3',
      }),
    ).toEqual({
      success: false,
      message: 'The person that invited you does not have a running subscription with Standard Notes anymore.',
    })

    expect(sharedSubscriptionInvitationRepository.save).not.toHaveBeenCalled()
    expect(userSubscriptionRepository.save).not.toHaveBeenCalled()
    expect(roleService.addUserRoleBasedOnSubscription).not.toHaveBeenCalled()
    expect(applyDefaultSubscriptionSettings.execute).not.toHaveBeenCalled()
  })

  it('should not create a shared subscription if inviter subscriptions are not active', async () => {
    const inviterSubscription1 = { endsAt: 1, planName: SubscriptionName.PlusPlan } as jest.Mocked<UserSubscription>
    const inviterSubscription2 = { endsAt: 2, planName: SubscriptionName.PlusPlan } as jest.Mocked<UserSubscription>

    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(3)

    userSubscriptionRepository.findBySubscriptionIdAndType = jest
      .fn()
      .mockReturnValue([inviterSubscription1, inviterSubscription2])

    expect(
      await createUseCase().execute({
        sharedSubscriptionInvitationUuid: '1-2-3',
      }),
    ).toEqual({
      success: false,
      message: 'The person that invited you does not have a running subscription with Standard Notes anymore.',
    })

    expect(sharedSubscriptionInvitationRepository.save).not.toHaveBeenCalled()
    expect(userSubscriptionRepository.save).not.toHaveBeenCalled()
    expect(roleService.addUserRoleBasedOnSubscription).not.toHaveBeenCalled()
    expect(applyDefaultSubscriptionSettings.execute).not.toHaveBeenCalled()
  })
})

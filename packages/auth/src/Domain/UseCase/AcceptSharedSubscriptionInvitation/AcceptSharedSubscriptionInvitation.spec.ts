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

import { AcceptSharedSubscriptionInvitation } from './AcceptSharedSubscriptionInvitation'
import { SubscriptionSettingServiceInterface } from '../../Setting/SubscriptionSettingServiceInterface'

describe('AcceptSharedSubscriptionInvitation', () => {
  let sharedSubscriptionInvitationRepository: SharedSubscriptionInvitationRepositoryInterface
  let userRepository: UserRepositoryInterface
  let userSubscriptionRepository: UserSubscriptionRepositoryInterface
  let roleService: RoleServiceInterface
  let subscriptionSettingService: SubscriptionSettingServiceInterface
  let timer: TimerInterface
  let invitee: User
  let inviterSubscription: UserSubscription
  let inviteeSubscription: UserSubscription
  let invitation: SharedSubscriptionInvitation

  const createUseCase = () =>
    new AcceptSharedSubscriptionInvitation(
      sharedSubscriptionInvitationRepository,
      userRepository,
      userSubscriptionRepository,
      roleService,
      subscriptionSettingService,
      timer,
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
      subscriptionId: 3,
    } as jest.Mocked<SharedSubscriptionInvitation>

    sharedSubscriptionInvitationRepository = {} as jest.Mocked<SharedSubscriptionInvitationRepositoryInterface>
    sharedSubscriptionInvitationRepository.findOneByUuidAndStatus = jest.fn().mockReturnValue(invitation)
    sharedSubscriptionInvitationRepository.save = jest.fn()

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByEmail = jest.fn().mockReturnValue(invitee)

    inviteeSubscription = { endsAt: 3, planName: SubscriptionName.PlusPlan } as jest.Mocked<UserSubscription>

    inviterSubscription = { endsAt: 3, planName: SubscriptionName.PlusPlan } as jest.Mocked<UserSubscription>

    userSubscriptionRepository = {} as jest.Mocked<UserSubscriptionRepositoryInterface>
    userSubscriptionRepository.findBySubscriptionIdAndType = jest.fn().mockReturnValue([inviterSubscription])
    userSubscriptionRepository.save = jest.fn().mockReturnValue(inviteeSubscription)

    roleService = {} as jest.Mocked<RoleServiceInterface>
    roleService.addUserRole = jest.fn()

    subscriptionSettingService = {} as jest.Mocked<SubscriptionSettingServiceInterface>
    subscriptionSettingService.applyDefaultSubscriptionSettingsForSubscription = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(1)
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
      user: Promise.resolve(invitee),
    })
    expect(roleService.addUserRole).toHaveBeenCalledWith(invitee, 'PLUS_PLAN')
    expect(subscriptionSettingService.applyDefaultSubscriptionSettingsForSubscription).toHaveBeenCalledWith(
      inviteeSubscription,
      'PLUS_PLAN',
    )
  })

  it('should not create a shared subscription if invitiation is not found', async () => {
    sharedSubscriptionInvitationRepository.findOneByUuidAndStatus = jest.fn().mockReturnValue(null)
    expect(
      await createUseCase().execute({
        sharedSubscriptionInvitationUuid: '1-2-3',
      }),
    ).toEqual({
      success: false,
    })

    expect(sharedSubscriptionInvitationRepository.save).not.toHaveBeenCalled()
    expect(userSubscriptionRepository.save).not.toHaveBeenCalled()
    expect(roleService.addUserRole).not.toHaveBeenCalled()
    expect(subscriptionSettingService.applyDefaultSubscriptionSettingsForSubscription).not.toHaveBeenCalled()
  })

  it('should not create a shared subscription if invitee is not found', async () => {
    userRepository.findOneByEmail = jest.fn().mockReturnValue(null)
    expect(
      await createUseCase().execute({
        sharedSubscriptionInvitationUuid: '1-2-3',
      }),
    ).toEqual({
      success: false,
    })

    expect(sharedSubscriptionInvitationRepository.save).not.toHaveBeenCalled()
    expect(userSubscriptionRepository.save).not.toHaveBeenCalled()
    expect(roleService.addUserRole).not.toHaveBeenCalled()
    expect(subscriptionSettingService.applyDefaultSubscriptionSettingsForSubscription).not.toHaveBeenCalled()
  })

  it('should not create a shared subscription if inviter subscription is not found', async () => {
    userSubscriptionRepository.findBySubscriptionIdAndType = jest.fn().mockReturnValue([])
    expect(
      await createUseCase().execute({
        sharedSubscriptionInvitationUuid: '1-2-3',
      }),
    ).toEqual({
      success: false,
    })

    expect(sharedSubscriptionInvitationRepository.save).not.toHaveBeenCalled()
    expect(userSubscriptionRepository.save).not.toHaveBeenCalled()
    expect(roleService.addUserRole).not.toHaveBeenCalled()
    expect(subscriptionSettingService.applyDefaultSubscriptionSettingsForSubscription).not.toHaveBeenCalled()
  })
})

import 'reflect-metadata'
import { GetUserSubscription } from './GetUserSubscription'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { User } from '../../User/User'
import { UserSubscriptionRepositoryInterface } from '../../Subscription/UserSubscriptionRepositoryInterface'
import { UserSubscription } from '../../Subscription/UserSubscription'
import { SubscriptionName } from '@standardnotes/common'

describe('GetUserSubscription', () => {
  let user: User
  let userSubscription: UserSubscription
  let userRepository: UserRepositoryInterface
  let userSubscriptionRepository: UserSubscriptionRepositoryInterface

  const createUseCase = () => new GetUserSubscription(userRepository, userSubscriptionRepository)

  beforeEach(() => {
    user = {
      uuid: '00000000-0000-0000-0000-000000000000',
      email: '00000000-0000-0000-0000-000000000000@example.com',
    } as jest.Mocked<User>
    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)

    userSubscription = {
      planName: SubscriptionName.ProPlan,
    } as jest.Mocked<UserSubscription>
    userSubscriptionRepository = {} as jest.Mocked<UserSubscriptionRepositoryInterface>
    userSubscriptionRepository.findOneByUserUuid = jest.fn().mockReturnValue(userSubscription)
  })

  it('should fail if a user is not found', async () => {
    userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    expect(await createUseCase().execute({ userUuid: '00000000-0000-0000-0000-000000000000' })).toEqual({
      success: false,
      error: {
        message: 'User 00000000-0000-0000-0000-000000000000 not found.',
      },
    })
  })

  it('should fail if a user uuid is invalid', async () => {
    expect(await createUseCase().execute({ userUuid: 'invalid' })).toEqual({
      success: false,
      error: {
        message: 'Given value is not a valid uuid: invalid',
      },
    })
  })

  it('should return user subscription', async () => {
    expect(await createUseCase().execute({ userUuid: '00000000-0000-0000-0000-000000000000' })).toEqual({
      success: true,
      user: { uuid: '00000000-0000-0000-0000-000000000000', email: '00000000-0000-0000-0000-000000000000@example.com' },
      subscription: {
        planName: SubscriptionName.ProPlan,
      },
    })
  })
})

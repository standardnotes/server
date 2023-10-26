import { UserSubscription } from '../../Subscription/UserSubscription'
import { UserSubscriptionRepositoryInterface } from '../../Subscription/UserSubscriptionRepositoryInterface'
import { UserSubscriptionType } from '../../Subscription/UserSubscriptionType'
import { GetSharedSubscriptionForUser } from './GetSharedSubscriptionForUser'

describe('GetSharedSubscriptionForUser', () => {
  let userSubscriptionRepository: UserSubscriptionRepositoryInterface

  const createUseCase = () => new GetSharedSubscriptionForUser(userSubscriptionRepository)

  beforeEach(() => {
    userSubscriptionRepository = {} as jest.Mocked<UserSubscriptionRepositoryInterface>
    userSubscriptionRepository.findOneByUserUuidAndType = jest.fn().mockReturnValue({
      subscriptionType: UserSubscriptionType.Shared,
    } as jest.Mocked<UserSubscription>)
  })

  it('should return a shared subscription', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue().subscriptionType).toEqual(UserSubscriptionType.Shared)
  })

  it('should return error if user subscription is not found', async () => {
    userSubscriptionRepository.findOneByUserUuidAndType = jest.fn().mockReturnValue(null)

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return error if user uuid is invalid', async () => {
    const result = await createUseCase().execute({
      userUuid: 'invalid',
    })

    expect(result.isFailed()).toBeTruthy()
  })
})

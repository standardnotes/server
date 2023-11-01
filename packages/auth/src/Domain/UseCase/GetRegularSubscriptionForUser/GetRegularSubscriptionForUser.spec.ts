import { UserSubscription } from '../../Subscription/UserSubscription'
import { UserSubscriptionRepositoryInterface } from '../../Subscription/UserSubscriptionRepositoryInterface'
import { UserSubscriptionType } from '../../Subscription/UserSubscriptionType'
import { GetRegularSubscriptionForUser } from './GetRegularSubscriptionForUser'

describe('GetRegularSubscriptionForUser', () => {
  let userSubscriptionRepository: UserSubscriptionRepositoryInterface
  let regularSubscription: UserSubscription

  const createUseCase = () => new GetRegularSubscriptionForUser(userSubscriptionRepository)

  beforeEach(() => {
    regularSubscription = {
      subscriptionType: UserSubscriptionType.Regular,
    } as jest.Mocked<UserSubscription>

    userSubscriptionRepository = {} as jest.Mocked<UserSubscriptionRepositoryInterface>
    userSubscriptionRepository.findOneByUserUuidAndType = jest.fn().mockResolvedValue(regularSubscription)
  })

  it('returns error when user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({ userUuid: 'invalid' })

    expect(result.isFailed()).toBe(true)
  })

  it('returns error when user subscription is not found', async () => {
    const useCase = createUseCase()
    userSubscriptionRepository.findOneByUserUuidAndType = jest.fn().mockResolvedValue(null)

    const result = await useCase.execute({ userUuid: '00000000-0000-0000-0000-000000000000' })

    expect(result.isFailed()).toBe(true)
  })

  it('returns regular subscription for user uuid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({ userUuid: '00000000-0000-0000-0000-000000000000' })

    expect(result.isFailed()).toBe(false)
    expect(result.getValue()).toBe(regularSubscription)
  })

  it('returns regular subscription for shared subscription id', async () => {
    const useCase = createUseCase()
    userSubscriptionRepository.findBySubscriptionIdAndType = jest.fn().mockResolvedValue([regularSubscription])

    const result = await useCase.execute({ subscriptionId: 1 })

    expect(result.isFailed()).toBe(false)
    expect(result.getValue()).toBe(regularSubscription)
  })

  it('returns error if subscription for shared subscription id is not found', async () => {
    const useCase = createUseCase()
    userSubscriptionRepository.findBySubscriptionIdAndType = jest.fn().mockResolvedValue([])

    const result = await useCase.execute({ subscriptionId: 1 })

    expect(result.isFailed()).toBe(true)
  })

  it('returns error if no parameters are specified', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({})

    expect(result.isFailed()).toBe(true)
  })
})

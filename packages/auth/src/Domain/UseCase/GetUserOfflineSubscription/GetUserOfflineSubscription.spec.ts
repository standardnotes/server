import 'reflect-metadata'

import { GetUserOfflineSubscription } from './GetUserOfflineSubscription'
import { SubscriptionName } from '@standardnotes/common'
import { OfflineUserSubscriptionRepositoryInterface } from '../../Subscription/OfflineUserSubscriptionRepositoryInterface'
import { OfflineUserSubscription } from '../../Subscription/OfflineUserSubscription'

describe('GetUserOfflineSubscription', () => {
  let userSubscription: OfflineUserSubscription
  let offlineUserSubscriptionRepository: OfflineUserSubscriptionRepositoryInterface

  const createUseCase = () => new GetUserOfflineSubscription(offlineUserSubscriptionRepository)

  beforeEach(() => {
    userSubscription = {
      planName: SubscriptionName.ProPlan,
    } as jest.Mocked<OfflineUserSubscription>

    offlineUserSubscriptionRepository = {} as jest.Mocked<OfflineUserSubscriptionRepositoryInterface>
    offlineUserSubscriptionRepository.findOneByEmail = jest.fn().mockReturnValue(userSubscription)
  })

  it('should return user offline subscription', async () => {
    expect(await createUseCase().execute({ userEmail: 'test@test.com' })).toEqual({
      success: true,
      subscription: {
        planName: SubscriptionName.ProPlan,
      },
    })
  })
})

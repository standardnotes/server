import 'reflect-metadata'
import { User } from '../User/User'
import { UserSubscription } from './UserSubscription'
import { UserSubscriptionRepositoryInterface } from './UserSubscriptionRepositoryInterface'

import { UserSubscriptionService } from './UserSubscriptionService'
import { UserSubscriptionType } from './UserSubscriptionType'

describe('UserSubscriptionService', () => {
  let userSubscriptionRepository: UserSubscriptionRepositoryInterface
  let regularSubscription: UserSubscription
  let sharedSubscription: UserSubscription
  let user: User

  const createService = () => new UserSubscriptionService(userSubscriptionRepository)

  beforeEach(() => {
    user = {
      uuid: '1-2-3',
    } as jest.Mocked<User>

    regularSubscription = {
      uuid: '1-2-3',
      subscriptionType: UserSubscriptionType.Regular,
      user: Promise.resolve(user),
    } as jest.Mocked<UserSubscription>
    sharedSubscription = {
      uuid: '2-3-4',
      subscriptionType: UserSubscriptionType.Shared,
      user: Promise.resolve(user),
    } as jest.Mocked<UserSubscription>

    userSubscriptionRepository = {} as jest.Mocked<UserSubscriptionRepositoryInterface>
    userSubscriptionRepository.findOneByUserUuid = jest.fn().mockReturnValue(null)
    userSubscriptionRepository.findOneByUuid = jest.fn().mockReturnValue(null)
    userSubscriptionRepository.findBySubscriptionIdAndType = jest.fn().mockReturnValue([])
  })

  describe('by uuid', () => {
    it('should return undefined if there is no user subscription', async () => {
      expect(await createService().findRegularSubscriptionForUuid('1-2-3')).toEqual({
        regularSubscription: null,
        sharedSubscription: null,
      })
    })

    it('should return a regular subscription if the uuid corresponds to a regular subscription', async () => {
      userSubscriptionRepository.findOneByUuid = jest.fn().mockReturnValue(regularSubscription)

      expect(await createService().findRegularSubscriptionForUuid('1-2-3')).toEqual({
        regularSubscription,
        sharedSubscription: null,
      })
    })

    it('should return a regular subscription if the uuid corresponds to a shared subscription', async () => {
      userSubscriptionRepository.findOneByUuid = jest.fn().mockReturnValue(sharedSubscription)
      userSubscriptionRepository.findBySubscriptionIdAndType = jest.fn().mockReturnValue([regularSubscription])

      expect(await createService().findRegularSubscriptionForUuid('1-2-3')).toEqual({
        regularSubscription,
        sharedSubscription,
      })
    })

    it('should return undefined if a regular subscription is not found corresponding to the shared subscription', async () => {
      userSubscriptionRepository.findOneByUuid = jest.fn().mockReturnValue(sharedSubscription)
      userSubscriptionRepository.findBySubscriptionIdAndType = jest.fn().mockReturnValue([])

      expect(await createService().findRegularSubscriptionForUuid('1-2-3')).toEqual({
        regularSubscription: null,
        sharedSubscription,
      })
    })
  })

  describe('by user uuid', () => {
    it('should return undefined if there is no user subscription', async () => {
      expect(await createService().findRegularSubscriptionForUserUuid('1-2-3')).toEqual({
        regularSubscription: null,
        sharedSubscription: null,
      })
    })

    it('should return a regular subscription if the uuid corresponds to a regular subscription', async () => {
      userSubscriptionRepository.findOneByUserUuid = jest.fn().mockReturnValue(regularSubscription)

      expect(await createService().findRegularSubscriptionForUserUuid('1-2-3')).toEqual({
        regularSubscription,
        sharedSubscription: null,
      })
    })

    it('should return a regular subscription if the uuid corresponds to a shared subscription', async () => {
      userSubscriptionRepository.findOneByUserUuid = jest.fn().mockReturnValue(sharedSubscription)
      userSubscriptionRepository.findBySubscriptionIdAndType = jest.fn().mockReturnValue([regularSubscription])

      expect(await createService().findRegularSubscriptionForUserUuid('1-2-3')).toEqual({
        regularSubscription,
        sharedSubscription,
      })
    })

    it('should return undefined if a regular subscription is not found corresponding to the shared subscription', async () => {
      userSubscriptionRepository.findOneByUserUuid = jest.fn().mockReturnValue(sharedSubscription)
      userSubscriptionRepository.findBySubscriptionIdAndType = jest.fn().mockReturnValue([])

      expect(await createService().findRegularSubscriptionForUserUuid('1-2-3')).toEqual({
        regularSubscription: null,
        sharedSubscription,
      })
    })
  })
})

import 'reflect-metadata'

import { OfflineSubscriptionTokenRepositoryInterface } from '../../Auth/OfflineSubscriptionTokenRepositoryInterface'

import { AuthenticateOfflineSubscriptionToken } from './AuthenticateOfflineSubscriptionToken'
import { OfflineUserSubscriptionRepositoryInterface } from '../../Subscription/OfflineUserSubscriptionRepositoryInterface'
import { OfflineUserSubscription } from '../../Subscription/OfflineUserSubscription'
import { OfflineSettingRepositoryInterface } from '../../Setting/OfflineSettingRepositoryInterface'
import { OfflineSetting } from '../../Setting/OfflineSetting'

describe('AuthenticateOfflineSubscriptionToken', () => {
  let offlineSubscriptionTokenRepository: OfflineSubscriptionTokenRepositoryInterface
  let offlineUserSubscriptionRepository: OfflineUserSubscriptionRepositoryInterface
  let offlineSettingRepository: OfflineSettingRepositoryInterface
  let offlineSetting: OfflineSetting

  const createUseCase = () =>
    new AuthenticateOfflineSubscriptionToken(
      offlineSubscriptionTokenRepository,
      offlineUserSubscriptionRepository,
      offlineSettingRepository,
    )

  beforeEach(() => {
    offlineSubscriptionTokenRepository = {} as jest.Mocked<OfflineSubscriptionTokenRepositoryInterface>
    offlineSubscriptionTokenRepository.getUserEmailByToken = jest.fn().mockReturnValue('test@test.com')

    offlineUserSubscriptionRepository = {} as jest.Mocked<OfflineUserSubscriptionRepositoryInterface>
    offlineUserSubscriptionRepository.findByEmail = jest
      .fn()
      .mockReturnValue([{} as jest.Mocked<OfflineUserSubscription>])

    offlineSetting = {
      email: 'test@test.com',
      value: 'offline-features-token',
    } as jest.Mocked<OfflineSetting>

    offlineSettingRepository = {} as jest.Mocked<OfflineSettingRepositoryInterface>
    offlineSettingRepository.findOneByNameAndEmail = jest.fn().mockReturnValue(offlineSetting)
  })

  it('should authenticate an dashboard token', async () => {
    const response = await createUseCase().execute({ token: 'test', userEmail: 'test@test.com' })

    expect(offlineUserSubscriptionRepository.findByEmail).toHaveBeenCalledWith('test@test.com', 0)

    expect(response.success).toBeTruthy()

    expect((<{ success: true; email: string }>response).email).toEqual('test@test.com')
  })

  it('should not authenticate an dashboard token if user has no features token', async () => {
    offlineSettingRepository.findOneByNameAndEmail = jest.fn().mockReturnValue(null)

    const response = await createUseCase().execute({ token: 'test', userEmail: 'test@test.com' })

    expect(offlineUserSubscriptionRepository.findByEmail).toHaveBeenCalledWith('test@test.com', 0)

    expect(response.success).toBeFalsy()
  })

  it('should not authenticate an dashboard token if it is not found', async () => {
    offlineSubscriptionTokenRepository.getUserEmailByToken = jest.fn().mockReturnValue(undefined)

    const response = await createUseCase().execute({ token: 'test', userEmail: 'test@test.com' })

    expect(response.success).toBeFalsy()
  })

  it('should not authenticate an dashboard token if it is for a different email', async () => {
    const response = await createUseCase().execute({ token: 'test', userEmail: 'test2@test.com' })

    expect(response.success).toBeFalsy()
  })

  it('should not authenticate an dashboard token if offline user subscription is not found', async () => {
    offlineUserSubscriptionRepository.findByEmail = jest.fn().mockReturnValue([])

    const response = await createUseCase().execute({ token: 'test', userEmail: 'test@test.com' })

    expect(response.success).toBeFalsy()
  })
})

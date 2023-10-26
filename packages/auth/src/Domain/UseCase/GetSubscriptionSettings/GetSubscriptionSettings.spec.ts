import { SettingCrypterInterface } from '../../Setting/SettingCrypterInterface'
import { SubscriptionSetting } from '../../Setting/SubscriptionSetting'
import { SubscriptionSettingRepositoryInterface } from '../../Setting/SubscriptionSettingRepositoryInterface'
import { GetSubscriptionSettings } from './GetSubscriptionSettings'

describe('GetSubscriptionSettings', () => {
  let subscriptionSettingRepository: SubscriptionSettingRepositoryInterface
  let subscriptionSetting: SubscriptionSetting
  let settingCrypter: SettingCrypterInterface

  const createUseCase = () => new GetSubscriptionSettings(subscriptionSettingRepository, settingCrypter)

  beforeEach(() => {
    subscriptionSetting = {} as jest.Mocked<SubscriptionSetting>

    subscriptionSettingRepository = {} as jest.Mocked<SubscriptionSettingRepositoryInterface>
    subscriptionSettingRepository.findAllBySubscriptionUuid = jest.fn().mockResolvedValue([subscriptionSetting])

    settingCrypter = {} as jest.Mocked<SettingCrypterInterface>
    settingCrypter.decryptSubscriptionSettingValue = jest.fn().mockResolvedValue('decrypted')
  })

  it('should return subscription settings', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({ userSubscriptionUuid: '00000000-0000-0000-0000-000000000000' })

    expect(result.isFailed()).toBe(false)
    expect(result.getValue()).toEqual([{ setting: subscriptionSetting }])
  })

  it('should return decrypted subscription settings', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      decryptWith: {
        userUuid: '00000000-0000-0000-0000-000000000000',
      },
    })

    expect(result.isFailed()).toBe(false)
    expect(result.getValue()).toEqual([{ setting: subscriptionSetting, decryptedValue: 'decrypted' }])
  })

  it('should return error when trying to decrypt setting with an invalid user uuid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userSubscriptionUuid: '00000000-0000-0000-0000-000000000000',
      decryptWith: {
        userUuid: 'invalid',
      },
    })

    expect(result.isFailed()).toBe(true)
  })

  it('should return error if user subscription uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({ userSubscriptionUuid: 'invalid' })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid')
  })
})

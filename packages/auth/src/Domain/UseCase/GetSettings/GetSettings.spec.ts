import { Setting } from '../../Setting/Setting'
import { SettingDecrypterInterface } from '../../Setting/SettingDecrypterInterface'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { GetSettings } from './GetSettings'

describe('GetSettings', () => {
  let settingRepository: SettingRepositoryInterface
  let settingDecrypter: SettingDecrypterInterface

  const createUseCase = () => new GetSettings(settingRepository, settingDecrypter)

  beforeEach(() => {
    settingRepository = {} as jest.Mocked<SettingRepositoryInterface>
    settingRepository.findAllByUserUuid = jest.fn().mockReturnValue([{} as jest.Mocked<Setting>])

    settingDecrypter = {} as jest.Mocked<SettingDecrypterInterface>
    settingDecrypter.decryptSettingValue = jest.fn().mockReturnValue('decrypted')
  })

  it('should return settings', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      decrypted: false,
    })

    expect(result.isFailed()).toBeFalsy()
  })

  it('should return decrypted settings', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      decrypted: true,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue()[0].decryptedValue).toEqual('decrypted')
  })

  it('should fail if user uuid is invalid', async () => {
    const result = await createUseCase().execute({
      userUuid: 'invalid',
      decrypted: false,
    })

    expect(result.isFailed()).toBeTruthy()
  })
})

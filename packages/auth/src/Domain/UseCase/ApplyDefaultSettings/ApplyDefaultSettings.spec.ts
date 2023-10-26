import { SettingsAssociationServiceInterface } from '../../Setting/SettingsAssociationServiceInterface'
import { SetSettingValue } from '../SetSettingValue/SetSettingValue'
import { ApplyDefaultSettings } from './ApplyDefaultSettings'

describe('ApplyDefaultSettings', () => {
  let settingsAssociationService: SettingsAssociationServiceInterface
  let setSettingValue: SetSettingValue

  const createUseCase = () => new ApplyDefaultSettings(settingsAssociationService, setSettingValue)

  beforeEach(() => {
    settingsAssociationService = {} as jest.Mocked<SettingsAssociationServiceInterface>
    settingsAssociationService.getDefaultSettingsAndValuesForNewUser = jest.fn().mockReturnValue(
      new Map([
        ['setting1', { value: 'value1', sensitive: false, serverEncryptionVersion: 0 }],
        ['setting2', { value: 'value2', sensitive: false, serverEncryptionVersion: 0 }],
      ]),
    )

    setSettingValue = {} as jest.Mocked<SetSettingValue>
    setSettingValue.execute = jest.fn().mockReturnValue(Promise.resolve())
  })

  it('should set default settings for a new user', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      userName: 'test@test.te',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(setSettingValue.execute).toHaveBeenCalledTimes(2)
  })

  it('should set default settings for a new private username account', async () => {
    settingsAssociationService.getDefaultSettingsAndValuesForNewPrivateUsernameAccount = jest.fn().mockReturnValue(
      new Map([
        ['setting1', { value: 'value1', sensitive: false, serverEncryptionVersion: 0 }],
        ['setting2', { value: 'value2', sensitive: false, serverEncryptionVersion: 0 }],
      ]),
    )

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      userName: 'a75a31ce95365904ef0e0a8e6cefc1f5e99adfef81bbdb6d4499eeb10ae0ff67',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(setSettingValue.execute).toHaveBeenCalledTimes(2)
  })

  it('should fail if user uuid is invalid', async () => {
    const result = await createUseCase().execute({
      userUuid: 'invalid',
      userName: 'test@test.te',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should fail if user name is invalid', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      userName: '',
    })

    expect(result.isFailed()).toBeTruthy()
  })
})

import { SettingName } from '@standardnotes/settings'
import 'reflect-metadata'
import { SettingProjector } from '../../../Projection/SettingProjector'
import { Setting } from '../../Setting/Setting'
import { SettingServiceInterface } from '../../Setting/SettingServiceInterface'

import { GetSetting } from './GetSetting'

describe('GetSetting', () => {
  let settingProjector: SettingProjector
  let setting: Setting
  let settingService: SettingServiceInterface

  const createUseCase = () => new GetSetting(settingProjector, settingService)

  beforeEach(() => {
    setting = {} as jest.Mocked<Setting>

    settingService = {} as jest.Mocked<SettingServiceInterface>
    settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue(setting)

    settingProjector = {} as jest.Mocked<SettingProjector>
    settingProjector.projectSimple = jest.fn().mockReturnValue({ foo: 'bar' })
  })

  it('should find a setting for user', async () => {
    expect(await createUseCase().execute({ userUuid: '1-2-3', settingName: 'test' })).toEqual({
      success: true,
      userUuid: '1-2-3',
      setting: { foo: 'bar' },
    })
  })

  it('should not get a setting for user if it does not exist', async () => {
    settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue(null)

    expect(await createUseCase().execute({ userUuid: '1-2-3', settingName: 'test' })).toEqual({
      success: false,
      error: {
        message: 'Setting test for user 1-2-3 not found!',
      },
    })
  })

  it('should not retrieve a sensitive setting for user', async () => {
    setting = {
      sensitive: true,
      name: SettingName.NAMES.MfaSecret,
    } as jest.Mocked<Setting>

    settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue(setting)

    expect(await createUseCase().execute({ userUuid: '1-2-3', settingName: SettingName.NAMES.MfaSecret })).toEqual({
      success: true,
      sensitive: true,
    })
  })

  it('should retrieve a sensitive setting for user if explicitly told to', async () => {
    setting = {
      sensitive: true,
      name: SettingName.NAMES.MfaSecret,
    } as jest.Mocked<Setting>

    settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue(setting)

    expect(
      await createUseCase().execute({ userUuid: '1-2-3', settingName: 'MFA_SECRET', allowSensitiveRetrieval: true }),
    ).toEqual({
      success: true,
      userUuid: '1-2-3',
      setting: { foo: 'bar' },
    })
  })
})

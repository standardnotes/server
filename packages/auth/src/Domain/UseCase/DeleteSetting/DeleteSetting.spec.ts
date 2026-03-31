import 'reflect-metadata'

import { TimerInterface } from '@standardnotes/time'

import { Setting } from '../../Setting/Setting'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'

import { DeleteSetting } from './DeleteSetting'
import { SettingName, Timestamps, Uuid, Result } from '@standardnotes/domain-core'
import { VerifyUserServerPassword } from '../VerifyUserServerPassword/VerifyUserServerPassword'

describe('DeleteSetting', () => {
  let setting: Setting
  let sensitiveSetting: Setting
  let settingRepository: SettingRepositoryInterface
  let verifyUserServerPassword: VerifyUserServerPassword
  let timer: TimerInterface

  const createUseCase = () => new DeleteSetting(settingRepository, verifyUserServerPassword, timer)

  beforeEach(() => {
    setting = Setting.create({
      name: SettingName.NAMES.LogSessionUserAgent,
      value: 'test',
      serverEncryptionVersion: 0,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      sensitive: false,
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()

    sensitiveSetting = Setting.create({
      name: SettingName.NAMES.MfaSecret,
      value: 'sensitive-value',
      serverEncryptionVersion: 0,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      sensitive: true,
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()

    settingRepository = {} as jest.Mocked<SettingRepositoryInterface>
    settingRepository.findLastByNameAndUserUuid = jest.fn().mockReturnValue(setting)
    settingRepository.findOneByUuid = jest.fn().mockReturnValue(setting)
    settingRepository.deleteByUserUuid = jest.fn()
    settingRepository.update = jest.fn()

    verifyUserServerPassword = {} as jest.Mocked<VerifyUserServerPassword>
    verifyUserServerPassword.execute = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(1)
  })

  describe('password validation for sensitive settings', () => {
    beforeEach(() => {
      settingRepository.findLastByNameAndUserUuid = jest.fn().mockReturnValue(sensitiveSetting)
    })

    it('should require server password for sensitive settings', async () => {
      verifyUserServerPassword.execute = jest
        .fn()
        .mockReturnValue(Result.fail('Please update your application to the latest version.'))

      const result = await createUseCase().execute({
        settingName: SettingName.NAMES.MfaSecret,
        userUuid: '00000000-0000-0000-0000-000000000000',
        shouldVerifyUserServerPassword: true,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toBe('Please update your application to the latest version.')
      }
      expect(verifyUserServerPassword.execute).toHaveBeenCalledWith({
        userUuid: '00000000-0000-0000-0000-000000000000',
        serverPassword: undefined,
      })
      expect(settingRepository.deleteByUserUuid).not.toHaveBeenCalled()
    })

    it('should succeed with correct server password for sensitive settings', async () => {
      verifyUserServerPassword.execute = jest.fn().mockReturnValue(Result.ok())

      const result = await createUseCase().execute({
        settingName: SettingName.NAMES.MfaSecret,
        userUuid: '00000000-0000-0000-0000-000000000000',
        serverPassword: 'correct-password',
        shouldVerifyUserServerPassword: true,
      })

      expect(result.success).toBe(true)
      expect(verifyUserServerPassword.execute).toHaveBeenCalledWith({
        userUuid: '00000000-0000-0000-0000-000000000000',
        serverPassword: 'correct-password',
      })
      expect(settingRepository.deleteByUserUuid).toHaveBeenCalledWith({
        userUuid: '00000000-0000-0000-0000-000000000000',
        settingName: SettingName.NAMES.MfaSecret,
      })
    })

    it('should fail with incorrect server password for sensitive settings', async () => {
      verifyUserServerPassword.execute = jest
        .fn()
        .mockReturnValue(Result.fail('The password you entered is incorrect. Please try again.'))

      const result = await createUseCase().execute({
        settingName: SettingName.NAMES.MfaSecret,
        userUuid: '00000000-0000-0000-0000-000000000000',
        serverPassword: 'wrong-password',
        shouldVerifyUserServerPassword: true,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toBe('The password you entered is incorrect. Please try again.')
      }
      expect(verifyUserServerPassword.execute).toHaveBeenCalledWith({
        userUuid: '00000000-0000-0000-0000-000000000000',
        serverPassword: 'wrong-password',
      })
      expect(settingRepository.deleteByUserUuid).not.toHaveBeenCalled()
    })

    it('should fail when user is not found for sensitive setting validation', async () => {
      verifyUserServerPassword.execute = jest.fn().mockReturnValue(Result.fail('User not found.'))

      const result = await createUseCase().execute({
        settingName: SettingName.NAMES.MfaSecret,
        userUuid: '00000000-0000-0000-0000-000000000000',
        serverPassword: 'some-password',
        shouldVerifyUserServerPassword: true,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toBe('User not found.')
      }
      expect(verifyUserServerPassword.execute).toHaveBeenCalledWith({
        userUuid: '00000000-0000-0000-0000-000000000000',
        serverPassword: 'some-password',
      })
      expect(settingRepository.deleteByUserUuid).not.toHaveBeenCalled()
    })

    it('should fail with invalid user UUID for sensitive setting validation', async () => {
      verifyUserServerPassword.execute = jest
        .fn()
        .mockReturnValue(Result.fail('Given value is not a valid uuid: invalid-uuid'))

      const result = await createUseCase().execute({
        settingName: SettingName.NAMES.MfaSecret,
        userUuid: 'invalid-uuid',
        serverPassword: 'some-password',
        shouldVerifyUserServerPassword: true,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toBe('Given value is not a valid uuid: invalid-uuid')
      }
      expect(verifyUserServerPassword.execute).toHaveBeenCalledWith({
        userUuid: 'invalid-uuid',
        serverPassword: 'some-password',
      })
      expect(settingRepository.deleteByUserUuid).not.toHaveBeenCalled()
    })

    it('should not require password for non-sensitive settings', async () => {
      settingRepository.findLastByNameAndUserUuid = jest.fn().mockReturnValue(setting)

      const result = await createUseCase().execute({
        settingName: SettingName.NAMES.LogSessionUserAgent,
        userUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.success).toBe(true)
      expect(verifyUserServerPassword.execute).not.toHaveBeenCalled()
      expect(settingRepository.deleteByUserUuid).toHaveBeenCalled()
    })

    it('should skip password validation when shouldVerifyUserServerPassword is false for sensitive settings', async () => {
      settingRepository.findLastByNameAndUserUuid = jest.fn().mockReturnValue(sensitiveSetting)

      const result = await createUseCase().execute({
        settingName: SettingName.NAMES.MfaSecret,
        userUuid: '00000000-0000-0000-0000-000000000000',
        shouldVerifyUserServerPassword: false,
      })

      expect(result.success).toBe(true)
      expect(verifyUserServerPassword.execute).not.toHaveBeenCalled()
      expect(settingRepository.deleteByUserUuid).toHaveBeenCalledWith({
        userUuid: '00000000-0000-0000-0000-000000000000',
        settingName: SettingName.NAMES.MfaSecret,
      })
    })

    it('should require password validation when shouldVerifyUserServerPassword is true for sensitive settings', async () => {
      verifyUserServerPassword.execute = jest.fn().mockReturnValue(Result.ok())
      settingRepository.findLastByNameAndUserUuid = jest.fn().mockReturnValue(sensitiveSetting)

      const result = await createUseCase().execute({
        settingName: SettingName.NAMES.MfaSecret,
        userUuid: '00000000-0000-0000-0000-000000000000',
        serverPassword: 'correct-password',
        shouldVerifyUserServerPassword: true,
      })

      expect(result.success).toBe(true)
      expect(verifyUserServerPassword.execute).toHaveBeenCalledWith({
        userUuid: '00000000-0000-0000-0000-000000000000',
        serverPassword: 'correct-password',
      })
      expect(settingRepository.deleteByUserUuid).toHaveBeenCalledWith({
        userUuid: '00000000-0000-0000-0000-000000000000',
        settingName: SettingName.NAMES.MfaSecret,
      })
    })
  })

  it('should delete a setting by name and user uuid', async () => {
    const result = await createUseCase().execute({
      settingName: SettingName.NAMES.LogSessionUserAgent,
      userUuid: '1-2-3',
    })

    expect(result.success).toBe(true)
    expect(settingRepository.deleteByUserUuid).toHaveBeenCalledWith({
      settingName: SettingName.NAMES.LogSessionUserAgent,
      userUuid: '1-2-3',
    })
  })

  it('should delete recovery codes setting if MFA secret is deleted', async () => {
    settingRepository.findLastByNameAndUserUuid = jest.fn().mockReturnValue(sensitiveSetting)
    verifyUserServerPassword.execute = jest.fn().mockReturnValue(Result.ok())

    const result = await createUseCase().execute({
      settingName: SettingName.NAMES.MfaSecret,
      userUuid: '00000000-0000-0000-0000-000000000000',
      serverPassword: 'correct-password',
      shouldVerifyUserServerPassword: true,
    })

    expect(result.success).toBe(true)
    expect(settingRepository.deleteByUserUuid).toHaveBeenNthCalledWith(1, {
      settingName: SettingName.NAMES.MfaSecret,
      userUuid: '00000000-0000-0000-0000-000000000000',
    })
    expect(settingRepository.deleteByUserUuid).toHaveBeenNthCalledWith(2, {
      userUuid: '00000000-0000-0000-0000-000000000000',
      settingName: SettingName.NAMES.RecoveryCodes,
    })
  })

  it('should delete a setting by uuid', async () => {
    const result = await createUseCase().execute({
      settingName: SettingName.NAMES.LogSessionUserAgent,
      userUuid: '1-2-3',
      uuid: '3-4-5',
    })

    expect(result.success).toBe(true)
    expect(settingRepository.deleteByUserUuid).toHaveBeenCalledWith({
      settingName: SettingName.NAMES.LogSessionUserAgent,
      userUuid: '1-2-3',
    })
  })

  it('should not delete a setting by name and user uuid if not found', async () => {
    settingRepository.findLastByNameAndUserUuid = jest.fn().mockReturnValue(null)

    const result = await createUseCase().execute({
      settingName: SettingName.NAMES.LogSessionUserAgent,
      userUuid: '1-2-3',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.message).toBe(`Setting ${SettingName.NAMES.LogSessionUserAgent} for user 1-2-3 not found.`)
    }
    expect(settingRepository.deleteByUserUuid).not.toHaveBeenCalled()
  })

  it('should not delete a setting by uuid if not found', async () => {
    settingRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    const result = await createUseCase().execute({
      settingName: SettingName.NAMES.LogSessionUserAgent,
      userUuid: '1-2-3',
      uuid: '2-3-4',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.message).toBe(`Setting ${SettingName.NAMES.LogSessionUserAgent} for user 1-2-3 not found.`)
    }
    expect(settingRepository.deleteByUserUuid).not.toHaveBeenCalled()
  })

  it('should soft delete a setting by name and user uuid', async () => {
    const result = await createUseCase().execute({
      settingName: SettingName.NAMES.LogSessionUserAgent,
      userUuid: '1-2-3',
      softDelete: true,
    })

    expect(result.success).toBe(true)
    expect(settingRepository.update).toHaveBeenCalled()
  })

  it('should soft delete a setting with timestamp', async () => {
    const result = await createUseCase().execute({
      settingName: SettingName.NAMES.LogSessionUserAgent,
      userUuid: '1-2-3',
      softDelete: true,
      timestamp: 123,
    })

    expect(result.success).toBe(true)
    expect(settingRepository.update).toHaveBeenCalled()
  })
})

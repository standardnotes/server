import 'reflect-metadata'
import { authenticator } from 'otplib'

import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { VerifyMFA } from './VerifyMFA'
import { Setting } from '../Setting/Setting'
import { SettingServiceInterface } from '../Setting/SettingServiceInterface'
import { SettingName } from '@standardnotes/settings'
import { SelectorInterface } from '@standardnotes/auth'
import { LockRepositoryInterface } from '../User/LockRepositoryInterface'

describe('VerifyMFA', () => {
  let user: User
  let setting: Setting
  let userRepository: UserRepositoryInterface
  let settingService: SettingServiceInterface
  let booleanSelector: SelectorInterface<boolean>
  let lockRepository: LockRepositoryInterface
  const pseudoKeyParamsKey = 'foobar'

  const createVerifyMFA = () =>
    new VerifyMFA(userRepository, settingService, booleanSelector, lockRepository, pseudoKeyParamsKey)

  beforeEach(() => {
    user = {} as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByEmail = jest.fn().mockReturnValue(user)

    booleanSelector = {} as jest.Mocked<SelectorInterface<boolean>>
    booleanSelector.select = jest.fn().mockReturnValue(false)

    lockRepository = {} as jest.Mocked<LockRepositoryInterface>
    lockRepository.isOTPLocked = jest.fn().mockReturnValue(false)
    lockRepository.lockSuccessfullOTP = jest.fn()

    setting = {
      name: SettingName.MfaSecret,
      value: 'shhhh',
    } as jest.Mocked<Setting>

    settingService = {} as jest.Mocked<SettingServiceInterface>
    settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue(setting)
  })

  it('should pass MFA verification if user has no MFA enabled', async () => {
    settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue(null)

    expect(
      await createVerifyMFA().execute({ email: 'test@test.te', requestParams: {}, preventOTPFromFurtherUsage: true }),
    ).toEqual({
      success: true,
    })

    expect(lockRepository.lockSuccessfullOTP).not.toHaveBeenCalled()
  })

  it('should pass MFA verification if user has MFA deleted', async () => {
    setting = {
      name: SettingName.MfaSecret,
      value: null,
    } as jest.Mocked<Setting>

    settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue(setting)

    expect(
      await createVerifyMFA().execute({ email: 'test@test.te', requestParams: {}, preventOTPFromFurtherUsage: true }),
    ).toEqual({
      success: true,
    })

    expect(lockRepository.lockSuccessfullOTP).not.toHaveBeenCalled()
  })

  it('should pass MFA verification if user is not found and pseudo mfa is not required', async () => {
    userRepository.findOneByEmail = jest.fn().mockReturnValue(null)
    expect(
      await createVerifyMFA().execute({ email: 'test@test.te', requestParams: {}, preventOTPFromFurtherUsage: true }),
    ).toEqual({
      success: true,
    })

    expect(lockRepository.lockSuccessfullOTP).not.toHaveBeenCalled()
  })

  it('should not pass MFA verification if user is not found and pseudo mfa is required', async () => {
    booleanSelector.select = jest.fn().mockReturnValue(true)
    userRepository.findOneByEmail = jest.fn().mockReturnValue(null)

    expect(
      await createVerifyMFA().execute({ email: 'test@test.te', requestParams: {}, preventOTPFromFurtherUsage: true }),
    ).toEqual({
      success: false,
      errorTag: 'mfa-required',
      errorMessage: 'Please enter your two-factor authentication code.',
      errorPayload: { mfa_key: expect.stringMatching(/^mfa_/) },
    })
  })

  it('should pass MFA verification if mfa key is correctly encrypted', async () => {
    expect(
      await createVerifyMFA().execute({
        email: 'test@test.te',
        requestParams: { 'mfa_1-2-3': authenticator.generate('shhhh') },
        preventOTPFromFurtherUsage: true,
      }),
    ).toEqual({
      success: true,
    })

    expect(lockRepository.lockSuccessfullOTP).toHaveBeenCalledWith('test@test.te', expect.any(String))
  })

  it('should pass MFA verification without locking otp', async () => {
    expect(
      await createVerifyMFA().execute({
        email: 'test@test.te',
        requestParams: { 'mfa_1-2-3': authenticator.generate('shhhh') },
        preventOTPFromFurtherUsage: false,
      }),
    ).toEqual({
      success: true,
    })

    expect(lockRepository.lockSuccessfullOTP).not.toHaveBeenCalled()
  })

  it('should not pass MFA verification if otp is already used within lock out period', async () => {
    lockRepository.isOTPLocked = jest.fn().mockReturnValue(true)

    expect(
      await createVerifyMFA().execute({
        email: 'test@test.te',
        requestParams: { 'mfa_1-2-3': authenticator.generate('shhhh') },
        preventOTPFromFurtherUsage: true,
      }),
    ).toEqual({
      success: false,
      errorTag: 'mfa-invalid',
      errorMessage:
        'The two-factor authentication code you entered has been already utilized. Please try again in a while.',
      errorPayload: { mfa_key: 'mfa_1-2-3' },
    })

    expect(lockRepository.lockSuccessfullOTP).not.toHaveBeenCalled()
  })

  it('should not pass MFA verification if mfa is not correct', async () => {
    setting = {
      name: SettingName.MfaSecret,
      value: 'shhhh2',
    } as jest.Mocked<Setting>

    settingService = {} as jest.Mocked<SettingServiceInterface>
    settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue(setting)

    expect(
      await createVerifyMFA().execute({
        email: 'test@test.te',
        requestParams: { 'mfa_1-2-3': 'test' },
        preventOTPFromFurtherUsage: true,
      }),
    ).toEqual({
      success: false,
      errorTag: 'mfa-invalid',
      errorMessage: 'The two-factor authentication code you entered is incorrect. Please try again.',
      errorPayload: { mfa_key: 'mfa_1-2-3' },
    })
  })

  it('should not pass MFA verification if no mfa param is found in the request', async () => {
    expect(
      await createVerifyMFA().execute({
        email: 'test@test.te',
        requestParams: { foo: 'bar' },
        preventOTPFromFurtherUsage: true,
      }),
    ).toEqual({
      success: false,
      errorTag: 'mfa-required',
      errorMessage: 'Please enter your two-factor authentication code.',
      errorPayload: { mfa_key: expect.stringMatching(/^mfa_/) },
    })
  })

  it('should throw an error if the error is not handled mfa validation error', async () => {
    settingService.findSettingWithDecryptedValue = jest.fn().mockImplementation(() => {
      throw new Error('oops!')
    })

    let error = null
    try {
      await createVerifyMFA().execute({
        email: 'test@test.te',
        requestParams: { 'mfa_1-2-3': 'test' },
        preventOTPFromFurtherUsage: true,
      })
    } catch (caughtError) {
      error = caughtError
    }

    expect(error).not.toBeNull()
  })
})

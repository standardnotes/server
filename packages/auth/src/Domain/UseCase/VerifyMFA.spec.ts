import 'reflect-metadata'
import { authenticator } from 'otplib'
import { SettingName } from '@standardnotes/settings'
import { SelectorInterface } from '@standardnotes/security'
import { Result, Timestamps, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { Setting } from '../Setting/Setting'
import { LockRepositoryInterface } from '../User/LockRepositoryInterface'
import { AuthenticatorRepositoryInterface } from '../Authenticator/AuthenticatorRepositoryInterface'

import { VerifyMFA } from './VerifyMFA'
import { Logger } from 'winston'
import { Authenticator } from '../Authenticator/Authenticator'
import { GetSetting } from './GetSetting/GetSetting'
import { EncryptionVersion } from '../Encryption/EncryptionVersion'

describe('VerifyMFA', () => {
  let user: User
  let setting: Setting
  let userRepository: UserRepositoryInterface
  let getSetting: GetSetting
  let booleanSelector: SelectorInterface<boolean>
  let lockRepository: LockRepositoryInterface
  let authenticatorRepository: AuthenticatorRepositoryInterface
  let verifyAuthenticatorAuthenticationResponse: UseCaseInterface<boolean>
  let logger: Logger
  const pseudoKeyParamsKey = 'foobar'

  const createVerifyMFA = () =>
    new VerifyMFA(
      userRepository,
      booleanSelector,
      lockRepository,
      pseudoKeyParamsKey,
      authenticatorRepository,
      verifyAuthenticatorAuthenticationResponse,
      getSetting,
      logger,
    )

  beforeEach(() => {
    user = {
      uuid: '00000000-0000-0000-0000-000000000000',
    } as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(user)

    booleanSelector = {} as jest.Mocked<SelectorInterface<boolean>>
    booleanSelector.select = jest.fn().mockReturnValue(false)

    lockRepository = {} as jest.Mocked<LockRepositoryInterface>
    lockRepository.isOTPLocked = jest.fn().mockReturnValue(false)
    lockRepository.lockSuccessfullOTP = jest.fn()

    setting = Setting.create({
      name: SettingName.NAMES.MfaSecret,
      value: '1243359u42395834',
      serverEncryptionVersion: EncryptionVersion.Default,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      sensitive: true,
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()

    getSetting = {} as jest.Mocked<GetSetting>
    getSetting.execute = jest.fn().mockReturnValue(Result.ok({ setting, decryptedValue: 'shhhh' }))

    authenticatorRepository = {} as jest.Mocked<AuthenticatorRepositoryInterface>
    authenticatorRepository.findByUserUuid = jest.fn().mockReturnValue([])

    verifyAuthenticatorAuthenticationResponse = {} as jest.Mocked<UseCaseInterface<boolean>>
    verifyAuthenticatorAuthenticationResponse.execute = jest.fn().mockReturnValue(Result.ok())

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
  })

  describe('2FA', () => {
    it('should pass MFA verification if user has no MFA enabled', async () => {
      getSetting.execute = jest.fn().mockReturnValue(Result.fail('not found'))

      expect(
        await createVerifyMFA().execute({ email: 'test@test.te', requestParams: {}, preventOTPFromFurtherUsage: true }),
      ).toEqual({
        success: true,
      })

      expect(lockRepository.lockSuccessfullOTP).not.toHaveBeenCalled()
    })

    it('should pass MFA verification if user has MFA deleted', async () => {
      setting = Setting.create({
        name: SettingName.NAMES.MfaSecret,
        value: null,
        serverEncryptionVersion: EncryptionVersion.Default,
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        sensitive: true,
        timestamps: Timestamps.create(123, 123).getValue(),
      }).getValue()

      getSetting.execute = jest.fn().mockReturnValue(Result.ok({ setting, decryptedValue: null }))

      expect(
        await createVerifyMFA().execute({ email: 'test@test.te', requestParams: {}, preventOTPFromFurtherUsage: true }),
      ).toEqual({
        success: true,
      })

      expect(lockRepository.lockSuccessfullOTP).not.toHaveBeenCalled()
    })

    it('should pass MFA verification if user is not found and pseudo mfa is not required', async () => {
      userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(null)
      expect(
        await createVerifyMFA().execute({ email: 'test@test.te', requestParams: {}, preventOTPFromFurtherUsage: true }),
      ).toEqual({
        success: true,
      })

      expect(lockRepository.lockSuccessfullOTP).not.toHaveBeenCalled()
    })

    it('should not pass MFA verification if user is not found and pseudo mfa is required', async () => {
      booleanSelector.select = jest.fn().mockReturnValueOnce(true).mockReturnValueOnce(false)
      userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(null)

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

    it('should not pass MFA if username is invalid', async () => {
      expect(
        await createVerifyMFA().execute({
          email: '',
          requestParams: { 'mfa_1-2-3': authenticator.generate('shhhh') },
          preventOTPFromFurtherUsage: true,
        }),
      ).toEqual({
        success: false,
        errorTag: 'invalid-auth',
        errorMessage: 'Username cannot be empty',
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
      setting = Setting.create({
        name: SettingName.NAMES.MfaSecret,
        value: 'aaa324523534werfe',
        serverEncryptionVersion: EncryptionVersion.Default,
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        sensitive: true,
        timestamps: Timestamps.create(123, 123).getValue(),
      }).getValue()

      getSetting.execute = jest.fn().mockReturnValue(Result.ok({ setting, decryptedValue: 'shhhh2' }))

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
      getSetting.execute = jest.fn().mockImplementation(() => {
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

  describe('U2F', () => {
    beforeEach(() => {
      getSetting.execute = jest.fn().mockReturnValue(Result.fail('not found'))

      authenticatorRepository.findByUserUuid = jest.fn().mockReturnValue([{} as jest.Mocked<Authenticator>])
    })

    it('should not pass if user is not found and pseudo u2f is required', async () => {
      booleanSelector.select = jest.fn().mockReturnValueOnce(true).mockReturnValueOnce(true)
      userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(null)

      expect(
        await createVerifyMFA().execute({ email: 'test@test.te', requestParams: {}, preventOTPFromFurtherUsage: true }),
      ).toEqual({
        success: false,
        errorTag: 'u2f-required',
        errorMessage: 'Please authenticate with your U2F device.',
      })
    })

    it('should not pass if the user has an invalid uuid', async () => {
      userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue({ uuid: 'invalid' } as jest.Mocked<User>)

      expect(
        await createVerifyMFA().execute({
          email: 'test@test.te',
          requestParams: {},
          preventOTPFromFurtherUsage: true,
        }),
      ).toEqual({
        success: false,
        errorMessage: 'User UUID is invalid.',
      })
    })

    it('should not pass if the request is missing authenticator response', async () => {
      expect(
        await createVerifyMFA().execute({
          email: 'test@test.te',
          requestParams: {},
          preventOTPFromFurtherUsage: true,
        }),
      ).toEqual({
        success: false,
        errorTag: 'u2f-required',
        errorMessage: 'Please authenticate with your U2F device.',
      })
    })

    it('should not pass if the authenticator response verification fails', async () => {
      verifyAuthenticatorAuthenticationResponse.execute = jest.fn().mockReturnValue(Result.fail('oops!'))

      expect(
        await createVerifyMFA().execute({
          email: 'test@test.te',
          requestParams: {
            authenticator_response: {
              id: Buffer.from([1]),
            },
          },
          preventOTPFromFurtherUsage: true,
        }),
      ).toEqual({
        success: false,
        errorTag: 'mfa-invalid',
        errorMessage: 'Could not verify U2F device.',
      })
    })

    it('should not pass if the authenticator is not verified', async () => {
      verifyAuthenticatorAuthenticationResponse.execute = jest.fn().mockReturnValue(Result.ok(false))

      expect(
        await createVerifyMFA().execute({
          email: 'test@test.te',
          requestParams: {
            authenticator_response: {
              id: Buffer.from([1]),
            },
          },
          preventOTPFromFurtherUsage: true,
        }),
      ).toEqual({
        success: false,
        errorTag: 'mfa-invalid',
        errorMessage: 'Could not verify U2F device.',
      })
    })

    it('should pass if the authenticator is verified', async () => {
      verifyAuthenticatorAuthenticationResponse.execute = jest.fn().mockReturnValue(Result.ok(true))

      expect(
        await createVerifyMFA().execute({
          email: 'test@test.te',
          requestParams: {
            authenticator_response: {
              id: Buffer.from([1]),
            },
          },
          preventOTPFromFurtherUsage: true,
        }),
      ).toEqual({
        success: true,
      })
    })
  })
})

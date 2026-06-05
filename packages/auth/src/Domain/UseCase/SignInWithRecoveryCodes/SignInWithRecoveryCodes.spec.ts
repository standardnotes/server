import { Result } from '@standardnotes/domain-core'

import { AuthResponseFactory20200115 } from '../../Auth/AuthResponseFactory20200115'
import { AuthenticatorRepositoryInterface } from '../../Authenticator/AuthenticatorRepositoryInterface'
import { CrypterInterface } from '../../Encryption/CrypterInterface'
import { Setting } from '../../Setting/Setting'
import { PKCERepositoryInterface } from '../../User/PKCERepositoryInterface'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { ClearLoginAttempts } from '../ClearLoginAttempts'
import { DeleteSetting } from '../DeleteSetting/DeleteSetting'
import { GenerateRecoveryCodes } from '../GenerateRecoveryCodes/GenerateRecoveryCodes'
import { IncreaseLoginAttempts } from '../IncreaseLoginAttempts'
import { SignInWithRecoveryCodes } from './SignInWithRecoveryCodes'
import { GetSetting } from '../GetSetting/GetSetting'
import { ApiVersion } from '../../Api/ApiVersion'
import { LockRepositoryInterface } from '../../User/LockRepositoryInterface'
import { VerifyHumanInteraction } from '../VerifyHumanInteraction/VerifyHumanInteraction'

describe('SignInWithRecoveryCodes', () => {
  let userRepository: UserRepositoryInterface
  let authResponseFactory: AuthResponseFactory20200115
  let pkceRepository: PKCERepositoryInterface
  let crypter: CrypterInterface
  let generateRecoveryCodes: GenerateRecoveryCodes
  let increaseLoginAttempts: IncreaseLoginAttempts
  let clearLoginAttempts: ClearLoginAttempts
  let deleteSetting: DeleteSetting
  let authenticatorRepository: AuthenticatorRepositoryInterface
  let getSetting: GetSetting
  let maxNonCaptchaAttempts: number
  let lockRepository: LockRepositoryInterface
  let verifyHumanInteractionUseCase: VerifyHumanInteraction

  const createUseCase = () =>
    new SignInWithRecoveryCodes(
      userRepository,
      authResponseFactory,
      pkceRepository,
      crypter,
      getSetting,
      generateRecoveryCodes,
      increaseLoginAttempts,
      clearLoginAttempts,
      deleteSetting,
      authenticatorRepository,
      maxNonCaptchaAttempts,
      lockRepository,
      verifyHumanInteractionUseCase,
    )

  beforeEach(() => {
    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue({
      uuid: '00000000-0000-0000-0000-000000000000',
      encryptedPassword: '$2a$11$K3g6XoTau8VmLJcai1bB0eD9/YvBSBRtBhMprJOaVZ0U3SgasZH3a',
    } as jest.Mocked<User>)

    authResponseFactory = {} as jest.Mocked<AuthResponseFactory20200115>
    authResponseFactory.createResponse = jest.fn().mockReturnValue({ response: { foo: 'bar' }, session: {} })

    pkceRepository = {} as jest.Mocked<PKCERepositoryInterface>
    pkceRepository.removeCodeChallenge = jest.fn().mockReturnValue(true)

    crypter = {} as jest.Mocked<CrypterInterface>
    crypter.base64URLEncode = jest.fn().mockReturnValue('base64-url-encoded')
    crypter.sha256Hash = jest.fn().mockReturnValue('sha256-hashed')

    getSetting = {} as jest.Mocked<GetSetting>
    getSetting.execute = jest
      .fn()
      .mockReturnValue(Result.ok({ setting: {} as jest.Mocked<Setting>, decryptedValue: 'foo' }))

    generateRecoveryCodes = {} as jest.Mocked<GenerateRecoveryCodes>
    generateRecoveryCodes.execute = jest.fn().mockReturnValue(Result.ok('1234 5678'))

    increaseLoginAttempts = {} as jest.Mocked<IncreaseLoginAttempts>
    increaseLoginAttempts.execute = jest.fn().mockReturnValue(Result.ok({ isNonCaptchaLimitReached: false }))

    clearLoginAttempts = {} as jest.Mocked<ClearLoginAttempts>
    clearLoginAttempts.execute = jest.fn()

    deleteSetting = {} as jest.Mocked<DeleteSetting>
    deleteSetting.execute = jest.fn()

    authenticatorRepository = {} as jest.Mocked<AuthenticatorRepositoryInterface>
    authenticatorRepository.removeByUserUuid = jest.fn()

    lockRepository = {} as jest.Mocked<LockRepositoryInterface>
    lockRepository.getLockCounter = jest.fn().mockReturnValue(0)

    maxNonCaptchaAttempts = 6

    verifyHumanInteractionUseCase = {} as jest.Mocked<VerifyHumanInteraction>
    verifyHumanInteractionUseCase.execute = jest.fn().mockReturnValue(Result.ok())
  })

  const requireHumanVerification = () => {
    lockRepository.getLockCounter = jest.fn().mockReturnValueOnce(maxNonCaptchaAttempts).mockReturnValueOnce(0)
    verifyHumanInteractionUseCase.execute = jest.fn()
  }

  it('should return error if password is not provided', async () => {
    const result = await createUseCase().execute({
      apiVersion: ApiVersion.VERSIONS.v20200115,
      userAgent: 'user-agent',
      username: 'test@test.te',
      password: '',
      codeVerifier: 'code-verifier',
      recoveryCodes: '1234 5678',
    })

    expect(result).toEqual({
      success: false,
      errorMessage: 'Empty password',
      isNonCaptchaLimitReached: false,
    })
  })

  it('should return error if username is not provided', async () => {
    const result = await createUseCase().execute({
      apiVersion: ApiVersion.VERSIONS.v20200115,
      userAgent: 'user-agent',
      username: '',
      password: 'qweqwe123123',
      codeVerifier: 'code-verifier',
      recoveryCodes: '1234 5678',
    })

    expect(result).toEqual({
      success: false,
      errorMessage: 'Could not sign in with recovery codes: Username cannot be empty',
      isNonCaptchaLimitReached: false,
    })
  })

  it('should return error if code verifier is not provided', async () => {
    const result = await createUseCase().execute({
      apiVersion: ApiVersion.VERSIONS.v20200115,
      userAgent: 'user-agent',
      username: 'username',
      password: 'qweqwe123123',
      codeVerifier: '',
      recoveryCodes: '1234 5678',
    })

    expect(result).toEqual({
      success: false,
      errorMessage: 'Invalid code verifier',
      isNonCaptchaLimitReached: false,
    })
  })

  it('should return error if recovery codes are not provided', async () => {
    const result = await createUseCase().execute({
      apiVersion: ApiVersion.VERSIONS.v20200115,
      userAgent: 'user-agent',
      username: 'username',
      password: 'qweqwe123123',
      codeVerifier: 'code-verifier',
      recoveryCodes: '',
    })

    expect(result).toEqual({
      success: false,
      errorMessage: 'Empty recovery codes',
      isNonCaptchaLimitReached: false,
    })
  })

  it('should return error if code verifier is invalid', async () => {
    pkceRepository.removeCodeChallenge = jest.fn().mockReturnValue(false)

    const result = await createUseCase().execute({
      apiVersion: ApiVersion.VERSIONS.v20200115,
      userAgent: 'user-agent',
      username: 'test@test.te',
      password: 'qweqwe123123',
      codeVerifier: 'code-verifier',
      recoveryCodes: '1234 5678',
    })

    expect(result).toEqual({
      success: false,
      errorMessage: 'Invalid code verifier',
      isNonCaptchaLimitReached: false,
    })
  })

  it('should return error if user is not found', async () => {
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(undefined)

    const result = await createUseCase().execute({
      apiVersion: ApiVersion.VERSIONS.v20200115,
      userAgent: 'user-agent',
      username: 'test@test.te',
      password: 'qweqwe123123',
      codeVerifier: 'code-verifier',
      recoveryCodes: '1234 5678',
    })

    expect(result).toEqual({
      success: false,
      errorMessage: 'Could not find user',
      isNonCaptchaLimitReached: false,
    })
  })

  it('should return error if recovery codes are invalid', async () => {
    const result = await createUseCase().execute({
      apiVersion: ApiVersion.VERSIONS.v20200115,
      userAgent: 'user-agent',
      username: 'test@test.te',
      password: 'qweqwe123123',
      codeVerifier: 'code-verifier',
      recoveryCodes: '1234 5678',
    })

    expect(result).toEqual({
      success: false,
      errorMessage: 'Invalid recovery codes',
      isNonCaptchaLimitReached: false,
    })
  })

  it('should return error if api version is invalid', async () => {
    const result = await createUseCase().execute({
      apiVersion: 'invalid',
      userAgent: 'user-agent',
      username: 'test@test.te',
      password: 'qweqwe123123',
      codeVerifier: 'code-verifier',
      recoveryCodes: '1234 5678',
    })

    expect(result).toEqual({
      success: false,
      errorMessage: 'Invalid api version: invalid',
      isNonCaptchaLimitReached: false,
    })
    expect(increaseLoginAttempts.execute).toHaveBeenCalledWith({
      email: 'test@test.te',
      skipUsernameValidation: true,
    })
  })

  it('should return error if api version does not support recovery sign in', async () => {
    const result = await createUseCase().execute({
      apiVersion: ApiVersion.VERSIONS.v20161215,
      userAgent: 'user-agent',
      username: 'test@test.te',
      password: 'qweqwe123123',
      codeVerifier: 'code-verifier',
      recoveryCodes: '1234 5678',
    })

    expect(result).toEqual({
      success: false,
      errorMessage: 'Unsupported api version',
      isNonCaptchaLimitReached: false,
    })
    expect(increaseLoginAttempts.execute).toHaveBeenCalledWith({
      email: 'test@test.te',
      skipUsernameValidation: true,
    })
  })

  it('should return error if password does not match', async () => {
    const result = await createUseCase().execute({
      apiVersion: ApiVersion.VERSIONS.v20200115,
      userAgent: 'user-agent',
      username: 'test@test.te',
      password: 'asdasd123123',
      codeVerifier: 'code-verifier',
      recoveryCodes: '1234 5678',
    })

    expect(result).toEqual({
      success: false,
      errorMessage: 'Invalid password',
      isNonCaptchaLimitReached: false,
    })
  })

  it('should return error if recovery codes are not generated for user', async () => {
    getSetting.execute = jest.fn().mockReturnValue(Result.fail('not found'))

    const result = await createUseCase().execute({
      apiVersion: ApiVersion.VERSIONS.v20200115,
      userAgent: 'user-agent',
      username: 'test@test.te',
      password: 'qweqwe123123',
      codeVerifier: 'code-verifier',
      recoveryCodes: '1234 5678',
    })

    expect(result).toEqual({
      success: false,
      errorMessage: 'User does not have recovery codes generated',
      isNonCaptchaLimitReached: false,
    })
  })

  it('should return error if generating new recovery codes fails', async () => {
    generateRecoveryCodes.execute = jest.fn().mockReturnValue(Result.fail('Oops'))

    const result = await createUseCase().execute({
      apiVersion: ApiVersion.VERSIONS.v20200115,
      userAgent: 'user-agent',
      username: 'test@test.te',
      password: 'qweqwe123123',
      codeVerifier: 'code-verifier',
      recoveryCodes: 'foo',
    })

    expect(result).toEqual({
      success: false,
      errorMessage: 'Could not sign in with recovery codes: Oops',
      isNonCaptchaLimitReached: false,
    })
    expect(authResponseFactory.createResponse).not.toHaveBeenCalled()
  })

  it('should return error if user has an invalid uuid', async () => {
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue({
      uuid: '1-2-3',
      encryptedPassword: '$2a$11$K3g6XoTau8VmLJcai1bB0eD9/YvBSBRtBhMprJOaVZ0U3SgasZH3a',
    } as jest.Mocked<User>)

    const result = await createUseCase().execute({
      apiVersion: ApiVersion.VERSIONS.v20200115,
      userAgent: 'user-agent',
      username: 'test@test.te',
      password: 'qweqwe123123',
      codeVerifier: 'code-verifier',
      recoveryCodes: 'foo',
    })

    expect(result).toEqual({
      success: false,
      errorMessage: 'Invalid user uuid',
      isNonCaptchaLimitReached: false,
    })
  })

  it('should return error if user requires human verification but no hvmtoken provided', async () => {
    lockRepository.getLockCounter = jest.fn().mockReturnValueOnce(maxNonCaptchaAttempts)
    verifyHumanInteractionUseCase = {} as jest.Mocked<VerifyHumanInteraction>
    verifyHumanInteractionUseCase.execute = jest
      .fn()
      .mockReturnValueOnce(Result.fail('Human verification step failed.'))

    const result = await createUseCase().execute({
      apiVersion: ApiVersion.VERSIONS.v20200115,
      userAgent: 'user-agent',
      username: 'test@test.te',
      password: 'qweqwe123123',
      codeVerifier: 'code-verifier',
      recoveryCodes: 'foo',
    })

    expect(result).toEqual({
      success: false,
      errorMessage: 'Human verification step failed.',
      isNonCaptchaLimitReached: true,
    })
  })

  it('should return isNonCaptchaLimitReached when incrementing login attempts reaches the limit', async () => {
    increaseLoginAttempts.execute = jest.fn().mockReturnValue(Result.ok({ isNonCaptchaLimitReached: true }))

    const result = await createUseCase().execute({
      apiVersion: ApiVersion.VERSIONS.v20200115,
      userAgent: 'user-agent',
      username: 'test@test.te',
      password: 'asdasd123123',
      codeVerifier: 'code-verifier',
      recoveryCodes: '1234 5678',
    })

    expect(result).toEqual({
      success: false,
      errorMessage: 'Invalid password',
      isNonCaptchaLimitReached: true,
    })
  })

  it('should increment login attempts once on invalid password', async () => {
    await createUseCase().execute({
      apiVersion: ApiVersion.VERSIONS.v20200115,
      userAgent: 'user-agent',
      username: 'test@test.te',
      password: 'asdasd123123',
      codeVerifier: 'code-verifier',
      recoveryCodes: '1234 5678',
    })

    expect(increaseLoginAttempts.execute).toHaveBeenCalledTimes(1)
    expect(increaseLoginAttempts.execute).toHaveBeenCalledWith({
      email: 'test@test.te',
      skipUsernameValidation: true,
    })
  })

  it('should not increment login attempts when human verification fails', async () => {
    requireHumanVerification()
    verifyHumanInteractionUseCase.execute = jest
      .fn()
      .mockReturnValueOnce(Result.fail('Human verification step failed.'))

    await createUseCase().execute({
      apiVersion: ApiVersion.VERSIONS.v20200115,
      userAgent: 'user-agent',
      username: 'test@test.te',
      password: 'qweqwe123123',
      codeVerifier: 'code-verifier',
      recoveryCodes: 'foo',
      hvmToken: 'bad-token',
    })

    expect(increaseLoginAttempts.execute).not.toHaveBeenCalled()
  })

  it('should not increment login attempts when human verification token is missing', async () => {
    requireHumanVerification()
    verifyHumanInteractionUseCase.execute = jest.fn().mockReturnValueOnce(Result.fail('No HVM token available.'))

    await createUseCase().execute({
      apiVersion: ApiVersion.VERSIONS.v20200115,
      userAgent: 'user-agent',
      username: 'test@test.te',
      password: 'qweqwe123123',
      codeVerifier: 'code-verifier',
      recoveryCodes: 'foo',
    })

    expect(increaseLoginAttempts.execute).not.toHaveBeenCalled()
  })

  it('should not set isNonCaptchaLimitReached when increasing login attempts fails', async () => {
    increaseLoginAttempts.execute = jest.fn().mockReturnValue(Result.fail('invalid email'))

    const result = await createUseCase().execute({
      apiVersion: ApiVersion.VERSIONS.v20200115,
      userAgent: 'user-agent',
      username: 'test@test.te',
      password: 'asdasd123123',
      codeVerifier: 'code-verifier',
      recoveryCodes: '1234 5678',
    })

    expect(result).toEqual({
      success: false,
      errorMessage: 'Invalid password',
    })
  })

  it('should return auth response with human verification required and passing', async () => {
    lockRepository.getLockCounter = jest.fn().mockReturnValueOnce(maxNonCaptchaAttempts)
    verifyHumanInteractionUseCase = {} as jest.Mocked<VerifyHumanInteraction>
    verifyHumanInteractionUseCase.execute = jest.fn().mockReturnValueOnce(Result.ok())

    const result = await createUseCase().execute({
      apiVersion: ApiVersion.VERSIONS.v20200115,
      userAgent: 'user-agent',
      username: 'test@test.te',
      password: 'qweqwe123123',
      codeVerifier: 'code-verifier',
      recoveryCodes: 'foo',
    })

    expect(clearLoginAttempts.execute).toHaveBeenCalled()
    expect(deleteSetting.execute).toHaveBeenCalledWith({
      settingName: 'MFA_SECRET',
      userUuid: '00000000-0000-0000-0000-000000000000',
    })
    expect(authenticatorRepository.removeByUserUuid).toHaveBeenCalled()
    expect(result.success).toBe(true)
  })

  it('should return auth response', async () => {
    const result = await createUseCase().execute({
      apiVersion: ApiVersion.VERSIONS.v20200115,
      userAgent: 'user-agent',
      username: 'test@test.te',
      password: 'qweqwe123123',
      codeVerifier: 'code-verifier',
      recoveryCodes: 'foo',
    })

    expect(clearLoginAttempts.execute).toHaveBeenCalled()
    expect(deleteSetting.execute).toHaveBeenCalledWith({
      settingName: 'MFA_SECRET',
      userUuid: '00000000-0000-0000-0000-000000000000',
    })
    expect(authenticatorRepository.removeByUserUuid).toHaveBeenCalled()
    expect(result.success).toBe(true)
  })
})

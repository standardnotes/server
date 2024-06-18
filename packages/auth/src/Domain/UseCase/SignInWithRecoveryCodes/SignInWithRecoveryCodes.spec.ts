import { Result } from '@standardnotes/domain-core'

import { AuthResponse20200115 } from '../../Auth/AuthResponse20200115'
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
    authResponseFactory.createResponse = jest.fn().mockReturnValue({} as jest.Mocked<AuthResponse20200115>)

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
    increaseLoginAttempts.execute = jest.fn()

    clearLoginAttempts = {} as jest.Mocked<ClearLoginAttempts>
    clearLoginAttempts.execute = jest.fn()

    deleteSetting = {} as jest.Mocked<DeleteSetting>
    deleteSetting.execute = jest.fn()

    authenticatorRepository = {} as jest.Mocked<AuthenticatorRepositoryInterface>
    authenticatorRepository.removeByUserUuid = jest.fn()

    lockRepository = {} as jest.Mocked<LockRepositoryInterface>
    lockRepository.getLockCounter = jest.fn().mockReturnValue(0)

    maxNonCaptchaAttempts = 6
  })

  it('should return error if password is not provided', async () => {
    const result = await createUseCase().execute({
      apiVersion: ApiVersion.VERSIONS.v20200115,
      userAgent: 'user-agent',
      username: 'test@test.te',
      password: '',
      codeVerifier: 'code-verifier',
      recoveryCodes: '1234 5678',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Empty password')
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

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Could not sign in with recovery codes: Username cannot be empty')
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

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Invalid code verifier')
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

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Empty recovery codes')
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

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Invalid code verifier')
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

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Could not find user')
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

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Invalid recovery codes')
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

    expect(result.isFailed()).toBe(true)
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

    expect(result.isFailed()).toBe(true)
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

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Invalid password')
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

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('User does not have recovery codes generated')
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

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Could not sign in with recovery codes: Oops')
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

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Invalid user uuid')
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

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Human verification step failed.')
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
    expect(deleteSetting.execute).toHaveBeenCalled()
    expect(authenticatorRepository.removeByUserUuid).toHaveBeenCalled()
    expect(result.isFailed()).toBe(false)
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
    expect(deleteSetting.execute).toHaveBeenCalled()
    expect(authenticatorRepository.removeByUserUuid).toHaveBeenCalled()
    expect(result.isFailed()).toBe(false)
  })
})

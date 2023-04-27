import { Result } from '@standardnotes/domain-core'

import { AuthResponse20200115 } from '../../Auth/AuthResponse20200115'
import { AuthResponseFactory20200115 } from '../../Auth/AuthResponseFactory20200115'
import { AuthenticatorRepositoryInterface } from '../../Authenticator/AuthenticatorRepositoryInterface'
import { CrypterInterface } from '../../Encryption/CrypterInterface'
import { Setting } from '../../Setting/Setting'
import { SettingServiceInterface } from '../../Setting/SettingServiceInterface'
import { PKCERepositoryInterface } from '../../User/PKCERepositoryInterface'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { ClearLoginAttempts } from '../ClearLoginAttempts'
import { DeleteSetting } from '../DeleteSetting/DeleteSetting'
import { GenerateRecoveryCodes } from '../GenerateRecoveryCodes/GenerateRecoveryCodes'
import { IncreaseLoginAttempts } from '../IncreaseLoginAttempts'
import { SignInWithRecoveryCodes } from './SignInWithRecoveryCodes'

describe('SignInWithRecoveryCodes', () => {
  let userRepository: UserRepositoryInterface
  let authResponseFactory: AuthResponseFactory20200115
  let pkceRepository: PKCERepositoryInterface
  let crypter: CrypterInterface
  let settingService: SettingServiceInterface
  let generateRecoveryCodes: GenerateRecoveryCodes
  let increaseLoginAttempts: IncreaseLoginAttempts
  let clearLoginAttempts: ClearLoginAttempts
  let deleteSetting: DeleteSetting
  let authenticatorRepository: AuthenticatorRepositoryInterface

  const createUseCase = () =>
    new SignInWithRecoveryCodes(
      userRepository,
      authResponseFactory,
      pkceRepository,
      crypter,
      settingService,
      generateRecoveryCodes,
      increaseLoginAttempts,
      clearLoginAttempts,
      deleteSetting,
      authenticatorRepository,
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

    settingService = {} as jest.Mocked<SettingServiceInterface>
    settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue({ value: 'foo' } as Setting)

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
  })

  it('should return error if password is not provided', async () => {
    const result = await createUseCase().execute({
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
      userAgent: 'user-agent',
      username: 'test@test.te',
      password: 'qweqwe123123',
      codeVerifier: 'code-verifier',
      recoveryCodes: '1234 5678',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Invalid recovery codes')
  })

  it('should return error if password does not match', async () => {
    const result = await createUseCase().execute({
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
    settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue(null)

    const result = await createUseCase().execute({
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
      userAgent: 'user-agent',
      username: 'test@test.te',
      password: 'qweqwe123123',
      codeVerifier: 'code-verifier',
      recoveryCodes: 'foo',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Invalid user uuid')
  })

  it('should return auth response', async () => {
    const result = await createUseCase().execute({
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

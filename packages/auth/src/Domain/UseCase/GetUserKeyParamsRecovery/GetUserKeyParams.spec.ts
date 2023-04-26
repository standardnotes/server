import { Setting } from '../../Setting/Setting'
import { SettingServiceInterface } from '../../Setting/SettingServiceInterface'
import { KeyParamsFactoryInterface } from '../../User/KeyParamsFactoryInterface'
import { PKCERepositoryInterface } from '../../User/PKCERepositoryInterface'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { GetUserKeyParamsRecovery } from './GetUserKeyParamsRecovery'

describe('GetUserKeyParamsRecovery', () => {
  let keyParamsFactory: KeyParamsFactoryInterface
  let userRepository: UserRepositoryInterface
  let settingService: SettingServiceInterface
  let user: User
  let pkceRepository: PKCERepositoryInterface

  const createUseCase = () =>
    new GetUserKeyParamsRecovery(keyParamsFactory, userRepository, pkceRepository, settingService)

  beforeEach(() => {
    keyParamsFactory = {} as jest.Mocked<KeyParamsFactoryInterface>
    keyParamsFactory.create = jest.fn().mockReturnValue({ foo: 'bar' })
    keyParamsFactory.createPseudoParams = jest.fn().mockReturnValue({ bar: 'baz' })

    user = {} as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(user)

    settingService = {} as jest.Mocked<SettingServiceInterface>
    settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue({ value: 'foo' } as Setting)

    pkceRepository = {} as jest.Mocked<PKCERepositoryInterface>
    pkceRepository.storeCodeChallenge = jest.fn()
  })

  it('should return error if code challenge is not provided', async () => {
    const result = await createUseCase().execute({
      username: 'username',
      codeChallenge: '',
      recoveryCodes: '1234 5678',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Invalid code challenge')
  })

  it('should return error if username is not provided', async () => {
    const result = await createUseCase().execute({
      username: '',
      codeChallenge: 'code-challenge',
      recoveryCodes: '1234 5678',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Could not sign in with recovery codes: Username cannot be empty')
  })

  it('should return error if recovery codes are not provided', async () => {
    const result = await createUseCase().execute({
      username: 'username',
      codeChallenge: 'codeChallenge',
      recoveryCodes: '',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Invalid recovery codes')
  })

  it('should return pseudo params if user does not exist', async () => {
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(null)

    const result = await createUseCase().execute({
      username: 'username',
      codeChallenge: 'codeChallenge',
      recoveryCodes: '1234 5678',
    })

    expect(keyParamsFactory.createPseudoParams).toHaveBeenCalled()
    expect(result.isFailed()).toBe(false)
  })

  it('should return error if user has no recovery codes generated', async () => {
    settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue(null)

    const result = await createUseCase().execute({
      username: 'username',
      codeChallenge: 'codeChallenge',
      recoveryCodes: '1234 5678',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('User does not have recovery codes generated')
  })

  it('should return error if recovery codes do not match', async () => {
    const result = await createUseCase().execute({
      username: 'username',
      codeChallenge: 'codeChallenge',
      recoveryCodes: '1234 5678',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Invalid recovery codes')
  })

  it('should return key params if recovery codes match', async () => {
    const result = await createUseCase().execute({
      username: 'username',
      codeChallenge: 'codeChallenge',
      recoveryCodes: 'foo',
    })

    expect(keyParamsFactory.create).toHaveBeenCalled()
    expect(result.isFailed()).toBe(false)
  })
})

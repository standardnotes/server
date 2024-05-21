import { Result } from '@standardnotes/domain-core'
import { Setting } from '../../Setting/Setting'
import { KeyParamsFactoryInterface } from '../../User/KeyParamsFactoryInterface'
import { PKCERepositoryInterface } from '../../User/PKCERepositoryInterface'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { GetSetting } from '../GetSetting/GetSetting'
import { GetUserKeyParamsRecovery } from './GetUserKeyParamsRecovery'
import { ApiVersion } from '../../Api/ApiVersion'

describe('GetUserKeyParamsRecovery', () => {
  let keyParamsFactory: KeyParamsFactoryInterface
  let userRepository: UserRepositoryInterface
  let getSetting: GetSetting
  let user: User
  let pkceRepository: PKCERepositoryInterface

  const createUseCase = () => new GetUserKeyParamsRecovery(keyParamsFactory, userRepository, pkceRepository, getSetting)

  beforeEach(() => {
    keyParamsFactory = {} as jest.Mocked<KeyParamsFactoryInterface>
    keyParamsFactory.create = jest.fn().mockReturnValue({ foo: 'bar' })
    keyParamsFactory.createPseudoParams = jest.fn().mockReturnValue({ bar: 'baz' })

    user = {} as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(user)

    getSetting = {} as jest.Mocked<GetSetting>
    getSetting.execute = jest
      .fn()
      .mockReturnValue(Result.ok({ setting: {} as jest.Mocked<Setting>, decryptedValue: 'foo' }))

    pkceRepository = {} as jest.Mocked<PKCERepositoryInterface>
    pkceRepository.storeCodeChallenge = jest.fn()
  })

  it('should return error if code challenge is not provided', async () => {
    const result = await createUseCase().execute({
      username: 'username',
      codeChallenge: '',
      recoveryCodes: '1234 5678',
      apiVersion: ApiVersion.VERSIONS.v20200115,
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Invalid code challenge')
  })

  it('should return error if username is not provided', async () => {
    const result = await createUseCase().execute({
      username: '',
      codeChallenge: 'code-challenge',
      recoveryCodes: '1234 5678',
      apiVersion: ApiVersion.VERSIONS.v20200115,
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Could not sign in with recovery codes: Username cannot be empty')
  })

  it('should return error if recovery codes are not provided', async () => {
    const result = await createUseCase().execute({
      username: 'username',
      codeChallenge: 'codeChallenge',
      recoveryCodes: '',
      apiVersion: ApiVersion.VERSIONS.v20200115,
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
      apiVersion: ApiVersion.VERSIONS.v20200115,
    })

    expect(keyParamsFactory.createPseudoParams).toHaveBeenCalled()
    expect(result.isFailed()).toBe(false)
  })

  it('should return error if user has no recovery codes generated', async () => {
    getSetting.execute = jest.fn().mockReturnValue(Result.fail('not found'))

    const result = await createUseCase().execute({
      username: 'username',
      codeChallenge: 'codeChallenge',
      recoveryCodes: '1234 5678',
      apiVersion: ApiVersion.VERSIONS.v20200115,
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('User does not have recovery codes generated')
  })

  it('should return error if recovery codes do not match', async () => {
    const result = await createUseCase().execute({
      username: 'username',
      codeChallenge: 'codeChallenge',
      recoveryCodes: '1234 5678',
      apiVersion: ApiVersion.VERSIONS.v20200115,
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Invalid recovery codes')
  })

  it('should return key params if recovery codes match', async () => {
    const result = await createUseCase().execute({
      username: 'username',
      codeChallenge: 'codeChallenge',
      recoveryCodes: 'foo',
      apiVersion: ApiVersion.VERSIONS.v20200115,
    })

    expect(keyParamsFactory.create).toHaveBeenCalled()
    expect(result.isFailed()).toBe(false)
  })

  it('should return error if api version is invalid', async () => {
    const result = await createUseCase().execute({
      username: 'username',
      codeChallenge: 'codeChallenge',
      recoveryCodes: 'foo',
      apiVersion: 'invalid',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Invalid api version: invalid')
  })

  it('should return error if api version does not support recovery sign in', async () => {
    const result = await createUseCase().execute({
      username: 'username',
      codeChallenge: 'codeChallenge',
      recoveryCodes: 'foo',
      apiVersion: ApiVersion.VERSIONS.v20190520,
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Unsupported api version')
  })
})

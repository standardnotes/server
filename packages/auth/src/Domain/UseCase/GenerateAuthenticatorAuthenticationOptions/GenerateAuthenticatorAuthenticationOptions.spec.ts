import { Dates, Result, Uuid } from '@standardnotes/domain-core'
import { Authenticator } from '../../Authenticator/Authenticator'

import { AuthenticatorChallenge } from '../../Authenticator/AuthenticatorChallenge'
import { AuthenticatorChallengeRepositoryInterface } from '../../Authenticator/AuthenticatorChallengeRepositoryInterface'
import { AuthenticatorRepositoryInterface } from '../../Authenticator/AuthenticatorRepositoryInterface'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { GenerateAuthenticatorAuthenticationOptions } from './GenerateAuthenticatorAuthenticationOptions'

describe('GenerateAuthenticatorAuthenticationOptions', () => {
  let userRepository: UserRepositoryInterface
  let authenticatorRepository: AuthenticatorRepositoryInterface
  let authenticatorChallengeRepository: AuthenticatorChallengeRepositoryInterface

  const createUseCase = () =>
    new GenerateAuthenticatorAuthenticationOptions(
      userRepository,
      authenticatorRepository,
      authenticatorChallengeRepository,
      'pseudo-key-params-key',
    )

  beforeEach(() => {
    const authenticator = Authenticator.create({
      counter: 1,
      credentialBackedUp: true,
      credentialDeviceType: 'singleDevice',
      credentialId: Buffer.from('credentialId'),
      credentialPublicKey: Buffer.from('credentialPublicKey'),
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      dates: Dates.create(new Date(1), new Date(1)).getValue(),
      transports: ['usb'],
    }).getValue()

    authenticatorRepository = {} as jest.Mocked<AuthenticatorRepositoryInterface>
    authenticatorRepository.findByUserUuid = jest.fn().mockReturnValue([authenticator])

    authenticatorChallengeRepository = {} as jest.Mocked<AuthenticatorChallengeRepositoryInterface>
    authenticatorChallengeRepository.save = jest.fn()

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue({
      uuid: '00000000-0000-0000-0000-000000000000',
    } as jest.Mocked<User>)
  })

  it('should return error if username is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      username: '',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Could not generate authenticator authentication options: Username cannot be empty')
  })

  it('should return error if user uuid is not valid', async () => {
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue({
      uuid: 'invalid',
    } as jest.Mocked<User>)

    const useCase = createUseCase()

    const result = await useCase.execute({
      username: 'test@test.te',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe(
      'Could not generate authenticator authentication options: Given value is not a valid uuid: invalid',
    )
  })

  it('should return pseudo options if user is not found', async () => {
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(null)

    const useCase = createUseCase()

    const result = await useCase.execute({
      username: 'test@test.te',
    })

    expect(result.isFailed()).toBe(false)
  })

  it('should return error if authenticator challenge is invalid', async () => {
    const mock = jest.spyOn(AuthenticatorChallenge, 'create')
    mock.mockReturnValue(Result.fail('Oops'))

    const useCase = createUseCase()

    const result = await useCase.execute({
      username: 'test@test.te',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Could not generate authenticator authentication options: Oops')

    mock.mockRestore()
  })

  it('should return authentication options', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      username: 'test@test.te',
    })

    expect(result.isFailed()).toBe(false)
    expect(authenticatorChallengeRepository.save).toHaveBeenCalled()
  })
})

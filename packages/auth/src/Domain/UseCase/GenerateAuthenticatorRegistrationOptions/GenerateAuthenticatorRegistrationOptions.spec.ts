import { Dates, Result, Uuid } from '@standardnotes/domain-core'
import { Authenticator } from '../../Authenticator/Authenticator'

import { AuthenticatorChallenge } from '../../Authenticator/AuthenticatorChallenge'
import { AuthenticatorChallengeRepositoryInterface } from '../../Authenticator/AuthenticatorChallengeRepositoryInterface'
import { AuthenticatorRepositoryInterface } from '../../Authenticator/AuthenticatorRepositoryInterface'
import { GenerateAuthenticatorRegistrationOptions } from './GenerateAuthenticatorRegistrationOptions'

describe('GenerateAuthenticatorRegistrationOptions', () => {
  let authenticatorRepository: AuthenticatorRepositoryInterface
  let authenticatorChallengeRepository: AuthenticatorChallengeRepositoryInterface

  const createUseCase = () =>
    new GenerateAuthenticatorRegistrationOptions(
      authenticatorRepository,
      authenticatorChallengeRepository,
      'Standard Notes',
      'standardnotes.com',
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
  })

  it('should return error if userUuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: 'invalid',
      username: 'username',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe(
      'Could not generate authenticator registration options: Given value is not a valid uuid: invalid',
    )
  })

  it('should return error if username is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      username: '',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Could not generate authenticator registration options: Username cannot be empty')
  })

  it('should return error if authenticator challenge is invalid', async () => {
    const mock = jest.spyOn(AuthenticatorChallenge, 'create')
    mock.mockReturnValue(Result.fail('Oops'))

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      username: 'username',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Could not generate authenticator registration options: Oops')

    mock.mockRestore()
  })

  it('should return registration options', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      username: 'username',
    })

    expect(result.isFailed()).toBe(false)
    expect(authenticatorChallengeRepository.save).toHaveBeenCalled()
  })
})

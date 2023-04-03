import { Dates, Uuid } from '@standardnotes/domain-core'

import { Authenticator } from '../../Authenticator/Authenticator'
import { AuthenticatorRepositoryInterface } from '../../Authenticator/AuthenticatorRepositoryInterface'
import { FeatureServiceInterface } from '../../Feature/FeatureServiceInterface'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { DeleteAuthenticator } from './DeleteAuthenticator'

describe('DeleteAuthenticator', () => {
  let authenticatorRepository: AuthenticatorRepositoryInterface
  let authenticator: Authenticator
  let userRepository: UserRepositoryInterface
  let featureService: FeatureServiceInterface

  const createUseCase = () => new DeleteAuthenticator(authenticatorRepository, userRepository, featureService)

  beforeEach(() => {
    authenticator = Authenticator.create({
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
    authenticatorRepository.findById = jest.fn().mockReturnValue(authenticator)
    authenticatorRepository.remove = jest.fn()

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUuid = jest.fn().mockReturnValue({} as jest.Mocked<User>)

    featureService = {} as jest.Mocked<FeatureServiceInterface>
    featureService.userIsEntitledToFeature = jest.fn().mockReturnValue(true)
  })

  it('should return error if authenticator not found', async () => {
    authenticatorRepository.findById = jest.fn().mockReturnValue(null)

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      authenticatorId: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toEqual('Authenticator not found')
  })

  it('should return error if user is not found', async () => {
    userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      authenticatorId: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toEqual('Could not delete authenticator: user not found.')
  })

  it('should return error if user is not entitled to U2F', async () => {
    featureService.userIsEntitledToFeature = jest.fn().mockReturnValue(false)

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      authenticatorId: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toEqual('Could not delete authenticator: user is not entitled to U2F.')
  })

  it('should return error if user uuid is not valid', async () => {
    const result = await createUseCase().execute({
      userUuid: 'invalid',
      authenticatorId: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toEqual('Could not delete authenticator: Given value is not a valid uuid: invalid')
  })

  it('should return error if authenticator does not belong to user', async () => {
    authenticatorRepository.findById = jest.fn().mockReturnValue({
      ...authenticator,
      props: {
        ...authenticator.props,
        userUuid: Uuid.create('00000000-0000-0000-0000-00000000a000').getValue(),
      },
    })

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      authenticatorId: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toEqual('Authenticator not found')
  })

  it('should delete authenticator', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      authenticatorId: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(false)
    expect(result.getValue()).toEqual('Authenticator deleted')
    expect(authenticatorRepository.remove).toHaveBeenCalled()
  })
})

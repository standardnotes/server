import * as simeplWebAuthnServer from '@simplewebauthn/server'
import { VerifiedRegistrationResponse } from '@simplewebauthn/server'
import { RegistrationResponseJSON } from '@simplewebauthn/typescript-types'
import { Result } from '@standardnotes/domain-core'
import { Authenticator } from '../../Authenticator/Authenticator'

import { AuthenticatorChallenge } from '../../Authenticator/AuthenticatorChallenge'
import { AuthenticatorChallengeRepositoryInterface } from '../../Authenticator/AuthenticatorChallengeRepositoryInterface'
import { AuthenticatorRepositoryInterface } from '../../Authenticator/AuthenticatorRepositoryInterface'
import { FeatureServiceInterface } from '../../Feature/FeatureServiceInterface'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { VerifyAuthenticatorRegistrationResponse } from './VerifyAuthenticatorRegistrationResponse'

describe('VerifyAuthenticatorRegistrationResponse', () => {
  let authenticatorRepository: AuthenticatorRepositoryInterface
  let authenticatorChallengeRepository: AuthenticatorChallengeRepositoryInterface
  let userRepository: UserRepositoryInterface
  let featureService: FeatureServiceInterface

  const createUseCase = () =>
    new VerifyAuthenticatorRegistrationResponse(
      authenticatorRepository,
      authenticatorChallengeRepository,
      'standardnotes.com',
      ['localhost', 'https://app.standardnotes.com'],
      true,
      userRepository,
      featureService,
    )

  beforeEach(() => {
    authenticatorRepository = {} as jest.Mocked<AuthenticatorRepositoryInterface>
    authenticatorRepository.save = jest.fn()

    authenticatorChallengeRepository = {} as jest.Mocked<AuthenticatorChallengeRepositoryInterface>
    authenticatorChallengeRepository.findByUserUuid = jest.fn().mockReturnValue({
      props: {
        challenge: Buffer.from('challenge'),
      },
    } as jest.Mocked<AuthenticatorChallenge>)

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUuid = jest.fn().mockReturnValue({} as jest.Mocked<User>)

    featureService = {} as jest.Mocked<FeatureServiceInterface>
    featureService.userIsEntitledToFeature = jest.fn().mockReturnValue(true)
  })

  it('should return error if user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: 'invalid',
      attestationResponse: {
        id: 'id',
        rawId: 'rawId',
        response: {
          attestationObject: 'attestationObject',
          clientDataJSON: 'clientDataJSON',
        },
        type: 'public-key',
        clientExtensionResults: {},
      } as jest.Mocked<RegistrationResponseJSON>,
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual(
      'Could not verify authenticator registration response: Given value is not a valid uuid: invalid',
    )
  })

  it('should return error if user is not entitled to feature', async () => {
    featureService.userIsEntitledToFeature = jest.fn().mockReturnValue(false)

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      attestationResponse: {
        id: 'id',
        rawId: 'rawId',
        response: {
          attestationObject: 'attestationObject',
          clientDataJSON: 'clientDataJSON',
        },
        type: 'public-key',
        clientExtensionResults: {},
      } as jest.Mocked<RegistrationResponseJSON>,
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual(
      'Could not verify authenticator registration response: user is not entitled to U2F.',
    )
  })

  it('should return error if user is not found', async () => {
    userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      attestationResponse: {
        id: 'id',
        rawId: 'rawId',
        response: {
          attestationObject: 'attestationObject',
          clientDataJSON: 'clientDataJSON',
        },
        type: 'public-key',
        clientExtensionResults: {},
      } as jest.Mocked<RegistrationResponseJSON>,
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Could not verify authenticator registration response: user not found.')
  })

  it('should return error if challenge is not found', async () => {
    authenticatorChallengeRepository.findByUserUuid = jest.fn().mockReturnValue(null)

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      attestationResponse: {
        id: 'id',
        rawId: 'rawId',
        response: {
          attestationObject: 'attestationObject',
          clientDataJSON: 'clientDataJSON',
        },
        type: 'public-key',
        clientExtensionResults: {},
      } as jest.Mocked<RegistrationResponseJSON>,
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Could not verify authenticator registration response: challenge not found')
  })

  it('should return error if verification could not verify', async () => {
    authenticatorChallengeRepository.findByUserUuid = jest.fn().mockReturnValue({
      props: {
        challenge: Buffer.from('challenge'),
      },
    } as jest.Mocked<AuthenticatorChallenge>)

    const useCase = createUseCase()

    const mock = jest.spyOn(simeplWebAuthnServer, 'verifyRegistrationResponse')
    mock.mockImplementation(() => {
      return Promise.resolve({
        verified: false,
        registrationInfo: {
          counter: 1,
          credentialBackedUp: true,
          credentialDeviceType: 'singleDevice',
          credentialID: Uint8Array.from([1, 2, 3]),
          credentialPublicKey: Uint8Array.from([1, 2, 3]),
        },
      } as jest.Mocked<VerifiedRegistrationResponse>)
    })

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      attestationResponse: {
        id: 'id',
        rawId: 'rawId',
        response: {
          attestationObject: 'attestationObject',
          clientDataJSON: 'clientDataJSON',
        },
        type: 'public-key',
        clientExtensionResults: {},
      } as jest.Mocked<RegistrationResponseJSON>,
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Could not verify authenticator registration response: verification failed')

    mock.mockRestore()
  })

  it('should return error if verification throws error', async () => {
    authenticatorChallengeRepository.findByUserUuid = jest.fn().mockReturnValue({
      props: {
        challenge: Buffer.from('challenge'),
      },
    } as jest.Mocked<AuthenticatorChallenge>)

    const useCase = createUseCase()

    const mock = jest.spyOn(simeplWebAuthnServer, 'verifyRegistrationResponse')
    mock.mockImplementation(() => {
      throw new Error('Oops')
    })

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      attestationResponse: {
        id: 'id',
        rawId: 'rawId',
        response: {
          attestationObject: 'attestationObject',
          clientDataJSON: 'clientDataJSON',
        },
        type: 'public-key',
        clientExtensionResults: {},
      } as jest.Mocked<RegistrationResponseJSON>,
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Could not verify authenticator registration response: Oops')

    mock.mockRestore()
  })

  it('should return error if verification is missing registration info', async () => {
    authenticatorChallengeRepository.findByUserUuid = jest.fn().mockReturnValue({
      props: {
        challenge: Buffer.from('challenge'),
      },
    } as jest.Mocked<AuthenticatorChallenge>)

    const useCase = createUseCase()

    const mock = jest.spyOn(simeplWebAuthnServer, 'verifyRegistrationResponse')
    mock.mockImplementation(() => {
      return Promise.resolve({
        verified: true,
      } as jest.Mocked<VerifiedRegistrationResponse>)
    })

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      attestationResponse: {
        id: 'id',
        rawId: 'rawId',
        response: {
          attestationObject: 'attestationObject',
          clientDataJSON: 'clientDataJSON',
        },
        type: 'public-key',
        clientExtensionResults: {},
      } as jest.Mocked<RegistrationResponseJSON>,
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual(
      'Could not verify authenticator registration response: registration info not found',
    )

    mock.mockRestore()
  })

  it('should return error if authenticator could not be created', async () => {
    authenticatorChallengeRepository.findByUserUuid = jest.fn().mockReturnValue({
      props: {
        challenge: Buffer.from('challenge'),
      },
    } as jest.Mocked<AuthenticatorChallenge>)

    const useCase = createUseCase()

    const mock = jest.spyOn(simeplWebAuthnServer, 'verifyRegistrationResponse')
    mock.mockImplementation(() => {
      return Promise.resolve({
        verified: true,
        registrationInfo: {
          counter: 1,
          credentialBackedUp: true,
          credentialDeviceType: 'singleDevice',
          credentialID: Uint8Array.from([1, 2, 3]),
          credentialPublicKey: Uint8Array.from([1, 2, 3]),
        },
      } as jest.Mocked<VerifiedRegistrationResponse>)
    })

    const mockAuthenticator = jest.spyOn(Authenticator, 'create')
    mockAuthenticator.mockImplementation(() => {
      return Result.fail('Oops')
    })

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      attestationResponse: {
        id: 'id',
        rawId: 'rawId',
        response: {
          attestationObject: 'attestationObject',
          clientDataJSON: 'clientDataJSON',
        },
        type: 'public-key',
        clientExtensionResults: {},
      } as jest.Mocked<RegistrationResponseJSON>,
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Could not verify authenticator registration response: Oops')

    mock.mockRestore()
    mockAuthenticator.mockRestore()
  })

  it('should verify authenticator registration response', async () => {
    authenticatorChallengeRepository.findByUserUuid = jest.fn().mockReturnValue({
      props: {
        challenge: Buffer.from('challenge'),
      },
    } as jest.Mocked<AuthenticatorChallenge>)

    const useCase = createUseCase()

    const mock = jest.spyOn(simeplWebAuthnServer, 'verifyRegistrationResponse')
    mock.mockImplementation(() => {
      return Promise.resolve({
        verified: true,
        registrationInfo: {
          counter: 1,
          credentialBackedUp: true,
          credentialDeviceType: 'singleDevice',
          credentialID: Uint8Array.from([1, 2, 3]),
          credentialPublicKey: Uint8Array.from([1, 2, 3]),
        },
      } as jest.Mocked<VerifiedRegistrationResponse>)
    })

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      attestationResponse: {
        id: 'id',
        rawId: 'rawId',
        response: {
          attestationObject: 'attestationObject',
          clientDataJSON: 'clientDataJSON',
        },
        type: 'public-key',
        clientExtensionResults: {},
      } as jest.Mocked<RegistrationResponseJSON>,
    })

    expect(result.isFailed()).toBeFalsy()

    mock.mockRestore()
  })
})

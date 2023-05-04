import { Uuid, Dates } from '@standardnotes/domain-core'
import * as simeplWebAuthnServer from '@simplewebauthn/server'
import { VerifiedAuthenticationResponse } from '@simplewebauthn/server'

import { Authenticator } from '../../Authenticator/Authenticator'
import { AuthenticatorChallenge } from '../../Authenticator/AuthenticatorChallenge'
import { AuthenticatorChallengeRepositoryInterface } from '../../Authenticator/AuthenticatorChallengeRepositoryInterface'
import { AuthenticatorRepositoryInterface } from '../../Authenticator/AuthenticatorRepositoryInterface'
import { VerifyAuthenticatorAuthenticationResponse } from './VerifyAuthenticatorAuthenticationResponse'

describe('VerifyAuthenticatorAuthenticationResponse', () => {
  let authenticatorRepository: AuthenticatorRepositoryInterface
  let authenticatorChallengeRepository: AuthenticatorChallengeRepositoryInterface

  const createUseCase = () =>
    new VerifyAuthenticatorAuthenticationResponse(
      authenticatorRepository,
      authenticatorChallengeRepository,
      'standardnotes.com',
      ['localhost', 'https://app.standardnotes.com'],
      true,
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
    authenticatorRepository.findByUserUuidAndCredentialId = jest.fn().mockReturnValue(authenticator)
    authenticatorRepository.updateCounter = jest.fn()

    authenticatorChallengeRepository = {} as jest.Mocked<AuthenticatorChallengeRepositoryInterface>
    authenticatorChallengeRepository.findByUserUuid = jest.fn().mockReturnValue({
      props: {
        challenge: 'challenge',
      },
    } as jest.Mocked<AuthenticatorChallenge>)
  })

  it('should return error if user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: 'invalid',
      authenticatorResponse: {
        authenticatorAttachment: 'platform',
        clientExtensionResults: {},
        id: 'id',
        rawId: 'rawId',
        response: {
          authenticatorData: 'authenticatorData',
          clientDataJSON: 'clientDataJSON',
          signature: 'signature',
          userHandle: 'userHandle',
        },
        type: 'public-key',
      },
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual(
      'Could not verify authenticator authentication response: Given value is not a valid uuid: invalid',
    )
  })

  it('should return error if authenticator is not found', async () => {
    authenticatorRepository.findByUserUuidAndCredentialId = jest.fn().mockReturnValue(null)

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      authenticatorResponse: {
        authenticatorAttachment: 'platform',
        clientExtensionResults: {},
        id: 'id',
        rawId: 'rawId',
        response: {
          authenticatorData: 'authenticatorData',
          clientDataJSON: 'clientDataJSON',
          signature: 'signature',
          userHandle: 'userHandle',
        },
        type: 'public-key',
      },
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual(
      'Could not verify authenticator authentication response: authenticator id not found',
    )
  })

  it('should return error if authenticator challenge is not found', async () => {
    authenticatorChallengeRepository.findByUserUuid = jest.fn().mockReturnValue(null)

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      authenticatorResponse: {
        authenticatorAttachment: 'platform',
        clientExtensionResults: {},
        id: 'id',
        rawId: 'rawId',
        response: {
          authenticatorData: 'authenticatorData',
          clientDataJSON: 'clientDataJSON',
          signature: 'signature',
          userHandle: 'userHandle',
        },
        type: 'public-key',
      },
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Could not verify authenticator authentication response: challenge not found')
  })

  it('should return error if verification throws error', async () => {
    const useCase = createUseCase()

    const mock = jest.spyOn(simeplWebAuthnServer, 'verifyAuthenticationResponse')
    mock.mockImplementation(() => {
      throw new Error('error')
    })

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      authenticatorResponse: {
        authenticatorAttachment: 'platform',
        clientExtensionResults: {},
        id: 'id',
        rawId: 'rawId',
        response: {
          authenticatorData: 'authenticatorData',
          clientDataJSON: 'clientDataJSON',
          signature: 'signature',
          userHandle: 'userHandle',
        },
        type: 'public-key',
      },
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Could not verify authenticator authentication response: error')

    mock.mockRestore()
  })

  it('should return error if verification is not successful', async () => {
    const useCase = createUseCase()

    const mock = jest.spyOn(simeplWebAuthnServer, 'verifyAuthenticationResponse')
    mock.mockReturnValue(
      Promise.resolve({
        verified: false,
      } as jest.Mocked<VerifiedAuthenticationResponse>),
    )

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      authenticatorResponse: {
        authenticatorAttachment: 'platform',
        clientExtensionResults: {},
        id: 'id',
        rawId: 'rawId',
        response: {
          authenticatorData: 'authenticatorData',
          clientDataJSON: 'clientDataJSON',
          signature: 'signature',
          userHandle: 'userHandle',
        },
        type: 'public-key',
      },
    })

    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Could not verify authenticator authentication response: verification failed')

    mock.mockRestore()
  })

  it('should persist new authenticator counter', async () => {
    const useCase = createUseCase()

    const mock = jest.spyOn(simeplWebAuthnServer, 'verifyAuthenticationResponse')
    mock.mockReturnValue(
      Promise.resolve({
        verified: true,
        authenticationInfo: {
          newCounter: 2,
        },
      } as jest.Mocked<VerifiedAuthenticationResponse>),
    )

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      authenticatorResponse: {
        authenticatorAttachment: 'platform',
        clientExtensionResults: {},
        id: 'id',
        rawId: 'rawId',
        response: {
          authenticatorData: 'authenticatorData',
          clientDataJSON: 'clientDataJSON',
          signature: 'signature',
          userHandle: 'userHandle',
        },
        type: 'public-key',
      },
    })

    expect(result.isFailed()).toBeFalsy()
    expect(authenticatorRepository.updateCounter).toHaveBeenCalled()
  })
})

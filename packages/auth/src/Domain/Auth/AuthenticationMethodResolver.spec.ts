import 'reflect-metadata'

import { SessionTokenData, TokenDecoderInterface } from '@standardnotes/security'

import { RevokedSession } from '../Session/RevokedSession'
import { Session } from '../Session/Session'
import { SessionServiceInterface } from '../Session/SessionServiceInterface'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'

import { AuthenticationMethodResolver } from './AuthenticationMethodResolver'
import { Logger } from 'winston'
import { GetSessionFromToken } from '../UseCase/GetSessionFromToken/GetSessionFromToken'
import { Result } from '@standardnotes/domain-core'

describe('AuthenticationMethodResolver', () => {
  let userRepository: UserRepositoryInterface
  let sessionService: SessionServiceInterface
  let sessionTokenDecoder: TokenDecoderInterface<SessionTokenData>
  let fallbackTokenDecoder: TokenDecoderInterface<SessionTokenData>
  let getSessionFromToken: GetSessionFromToken
  let user: User
  let session: Session
  let revokedSession: RevokedSession
  let logger: Logger

  const createResolver = () =>
    new AuthenticationMethodResolver(
      userRepository,
      sessionService,
      sessionTokenDecoder,
      fallbackTokenDecoder,
      getSessionFromToken,
      logger,
    )

  beforeEach(() => {
    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.info = jest.fn()

    user = {} as jest.Mocked<User>

    session = {
      userUuid: '00000000-0000-0000-0000-000000000000',
    } as jest.Mocked<Session>

    revokedSession = {} as jest.Mocked<RevokedSession>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)

    sessionService = {} as jest.Mocked<SessionServiceInterface>
    sessionService.getRevokedSessionFromToken = jest.fn()
    sessionService.markRevokedSessionAsReceived = jest.fn().mockReturnValue(revokedSession)

    getSessionFromToken = {} as jest.Mocked<GetSessionFromToken>
    getSessionFromToken.execute = jest.fn().mockReturnValue(Result.fail('No session found.'))

    sessionTokenDecoder = {} as jest.Mocked<TokenDecoderInterface<SessionTokenData>>
    sessionTokenDecoder.decodeToken = jest.fn()

    fallbackTokenDecoder = {} as jest.Mocked<TokenDecoderInterface<SessionTokenData>>
    fallbackTokenDecoder.decodeToken = jest.fn()
  })

  it('should resolve jwt authentication method', async () => {
    sessionTokenDecoder.decodeToken = jest.fn().mockReturnValue({ user_uuid: '00000000-0000-0000-0000-000000000000' })

    expect(
      await createResolver().resolve({
        authTokenFromHeaders: 'test',
        requestMetadata: { url: '/foobar', method: 'GET' },
      }),
    ).toEqual({
      claims: {
        user_uuid: '00000000-0000-0000-0000-000000000000',
      },
      type: 'jwt',
      user,
    })
  })

  it('should not resolve jwt authentication method with invalid user uuid', async () => {
    sessionTokenDecoder.decodeToken = jest.fn().mockReturnValue({ user_uuid: 'invalid' })

    expect(
      await createResolver().resolve({
        authTokenFromHeaders: 'test',
        requestMetadata: { url: '/foobar', method: 'GET' },
      }),
    ).toBeUndefined
  })

  it('should resolve session authentication method', async () => {
    getSessionFromToken.execute = jest
      .fn()
      .mockReturnValue(Result.ok({ session, isEphemeral: false, givenTokensWereInCooldown: false }))

    expect(
      await createResolver().resolve({
        authTokenFromHeaders: 'test',
        requestMetadata: { url: '/foobar', method: 'GET' },
      }),
    ).toEqual({
      session,
      type: 'session_token',
      user,
      givenTokensWereInCooldown: false,
    })
  })

  it('should not resolve session authentication method with invalid user uuid on session', async () => {
    getSessionFromToken.execute = jest
      .fn()
      .mockReturnValue(
        Result.ok({ session: { userUuid: 'invalid' }, isEphemeral: false, givenTokensWereInCooldown: false }),
      )

    expect(
      await createResolver().resolve({
        authTokenFromHeaders: 'test',
        requestMetadata: { url: '/foobar', method: 'GET' },
      }),
    ).toBeUndefined
  })

  it('should resolve archvied session authentication method', async () => {
    sessionService.getRevokedSessionFromToken = jest.fn().mockReturnValue(revokedSession)

    expect(
      await createResolver().resolve({
        authTokenFromHeaders: 'test',
        requestMetadata: { url: '/foobar', method: 'GET' },
      }),
    ).toEqual({
      revokedSession,
      type: 'revoked',
      user: null,
    })

    expect(sessionService.markRevokedSessionAsReceived).toHaveBeenCalled()
  })

  it('should indicated that authentication method cannot be resolved', async () => {
    expect(
      await createResolver().resolve({
        authTokenFromHeaders: 'test',
        requestMetadata: { url: '/foobar', method: 'GET' },
      }),
    ).toBeUndefined
  })
})

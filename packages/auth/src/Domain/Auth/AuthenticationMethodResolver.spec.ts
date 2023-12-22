import 'reflect-metadata'

import { SessionTokenData, TokenDecoderInterface } from '@standardnotes/security'

import { RevokedSession } from '../Session/RevokedSession'
import { Session } from '../Session/Session'
import { SessionServiceInterface } from '../Session/SessionServiceInterface'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'

import { AuthenticationMethodResolver } from './AuthenticationMethodResolver'
import { Logger } from 'winston'

describe('AuthenticationMethodResolver', () => {
  let userRepository: UserRepositoryInterface
  let sessionService: SessionServiceInterface
  let sessionTokenDecoder: TokenDecoderInterface<SessionTokenData>
  let fallbackTokenDecoder: TokenDecoderInterface<SessionTokenData>
  let user: User
  let session: Session
  let revokedSession: RevokedSession
  let logger: Logger

  const createResolver = () =>
    new AuthenticationMethodResolver(userRepository, sessionService, sessionTokenDecoder, fallbackTokenDecoder, logger)

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
    sessionService.getSessionFromToken = jest.fn().mockReturnValue({ session: undefined, isEphemeral: false })
    sessionService.getRevokedSessionFromToken = jest.fn()
    sessionService.markRevokedSessionAsReceived = jest.fn().mockReturnValue(revokedSession)

    sessionTokenDecoder = {} as jest.Mocked<TokenDecoderInterface<SessionTokenData>>
    sessionTokenDecoder.decodeToken = jest.fn()

    fallbackTokenDecoder = {} as jest.Mocked<TokenDecoderInterface<SessionTokenData>>
    fallbackTokenDecoder.decodeToken = jest.fn()
  })

  it('should resolve jwt authentication method', async () => {
    sessionTokenDecoder.decodeToken = jest.fn().mockReturnValue({ user_uuid: '00000000-0000-0000-0000-000000000000' })

    expect(await createResolver().resolve('test')).toEqual({
      claims: {
        user_uuid: '00000000-0000-0000-0000-000000000000',
      },
      type: 'jwt',
      user,
    })
  })

  it('should not resolve jwt authentication method with invalid user uuid', async () => {
    sessionTokenDecoder.decodeToken = jest.fn().mockReturnValue({ user_uuid: 'invalid' })

    expect(await createResolver().resolve('test')).toBeUndefined
  })

  it('should resolve session authentication method', async () => {
    sessionService.getSessionFromToken = jest.fn().mockReturnValue({ session, isEphemeral: false })

    expect(await createResolver().resolve('test')).toEqual({
      session,
      type: 'session_token',
      user,
    })
  })

  it('should not resolve session authentication method with invalid user uuid on session', async () => {
    sessionService.getSessionFromToken = jest
      .fn()
      .mockReturnValue({ session: { userUuid: 'invalid' }, isEphemeral: false })

    expect(await createResolver().resolve('test')).toBeUndefined
  })

  it('should resolve archvied session authentication method', async () => {
    sessionService.getRevokedSessionFromToken = jest.fn().mockReturnValue(revokedSession)

    expect(await createResolver().resolve('test')).toEqual({
      revokedSession,
      type: 'revoked',
      user: null,
    })

    expect(sessionService.markRevokedSessionAsReceived).toHaveBeenCalled()
  })

  it('should indicated that authentication method cannot be resolved', async () => {
    expect(await createResolver().resolve('test')).toBeUndefined
  })
})

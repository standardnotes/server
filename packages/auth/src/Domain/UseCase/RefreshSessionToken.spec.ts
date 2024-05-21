import 'reflect-metadata'

import { Session } from '../Session/Session'
import { SessionServiceInterface } from '../Session/SessionServiceInterface'
import { RefreshSessionToken } from './RefreshSessionToken'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { Logger } from 'winston'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { GetSetting } from './GetSetting/GetSetting'
import { Result } from '@standardnotes/domain-core'
import { LogSessionUserAgentOption } from '@standardnotes/settings'
import { Setting } from '../Setting/Setting'
import { SessionService } from '../Session/SessionService'
import { SessionCreationResult } from '../Session/SessionCreationResult'
import { ApiVersion } from '../Api/ApiVersion'
import { CooldownSessionTokens } from './CooldownSessionTokens/CooldownSessionTokens'
import { GetSessionFromToken } from './GetSessionFromToken/GetSessionFromToken'

describe('RefreshSessionToken', () => {
  let sessionService: SessionServiceInterface
  let session: Session
  let domainEventFactory: DomainEventFactoryInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let timer: TimerInterface
  let getSetting: GetSetting
  let logger: Logger
  let sessionCreationResult: SessionCreationResult
  let cooldownSessionTokens: CooldownSessionTokens
  let getSessionFromToken: GetSessionFromToken

  const createUseCase = () =>
    new RefreshSessionToken(
      sessionService,
      domainEventFactory,
      domainEventPublisher,
      timer,
      getSetting,
      cooldownSessionTokens,
      getSessionFromToken,
      logger,
    )

  beforeEach(() => {
    session = {} as jest.Mocked<Session>
    session.uuid = '1-2-3'
    session.refreshExpiration = new Date(123)
    session.version = SessionService.HEADER_BASED_SESSION_VERSION
    session.hashedAccessToken = '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce'
    session.hashedRefreshToken = '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce'

    sessionCreationResult = {} as jest.Mocked<SessionCreationResult>

    getSetting = {} as jest.Mocked<GetSetting>
    getSetting.execute = jest.fn().mockReturnValue(Result.fail('not found'))

    sessionService = {} as jest.Mocked<SessionServiceInterface>
    sessionService.refreshTokens = jest.fn().mockReturnValue(sessionCreationResult)

    getSessionFromToken = {} as jest.Mocked<GetSessionFromToken>
    getSessionFromToken.execute = jest.fn().mockReturnValue(Result.ok({ session, isEphemeral: false }))

    cooldownSessionTokens = {} as jest.Mocked<CooldownSessionTokens>
    cooldownSessionTokens.execute = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createSessionRefreshedEvent = jest.fn().mockReturnValue({})

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.getUTCDate = jest.fn().mockReturnValue(new Date(100))

    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()
    logger.debug = jest.fn()
  })

  it('should refresh session token', async () => {
    const result = await createUseCase().execute({
      authTokenFromHeaders: '123',
      refreshTokenFromHeaders: '1:2:3',
      requestMetadata: { url: '/foobar', method: 'GET', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
      apiVersion: ApiVersion.VERSIONS.v20200115,
    })

    expect(sessionService.refreshTokens).toHaveBeenCalledWith({
      session,
      isEphemeral: false,
      apiVersion: ApiVersion.create(ApiVersion.VERSIONS.v20200115).getValue(),
    })

    expect(result).toEqual({
      success: true,
      result: sessionCreationResult,
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should refresh cookie token', async () => {
    session.version = SessionService.COOKIE_BASED_SESSION_VERSION
    getSessionFromToken.execute = jest.fn().mockReturnValue(Result.ok({ session, isEphemeral: false }))

    const result = await createUseCase().execute({
      authTokenFromHeaders: '123',
      refreshTokenFromHeaders: '2:2:3',
      authCookies: new Map([['refresh_token_1-2-3', ['3']]]),
      requestMetadata: { url: '/foobar', method: 'GET', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
      apiVersion: ApiVersion.VERSIONS.v20200115,
    })

    expect(result).toEqual({
      success: true,
      result: sessionCreationResult,
    })

    expect(sessionService.refreshTokens).toHaveBeenCalledWith({
      session,
      isEphemeral: false,
      apiVersion: ApiVersion.create(ApiVersion.VERSIONS.v20200115).getValue(),
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should refresh session token and update user agent if enabled', async () => {
    getSetting.execute = jest.fn().mockReturnValue(
      Result.ok({
        setting: {} as jest.Mocked<Setting>,
        decryptedValue: LogSessionUserAgentOption.Enabled,
      }),
    )

    const result = await createUseCase().execute({
      authTokenFromHeaders: '123',
      refreshTokenFromHeaders: '1:2:3',
      requestMetadata: { url: '/foobar', method: 'GET', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
      apiVersion: ApiVersion.VERSIONS.v20200115,
    })

    expect(sessionService.refreshTokens).toHaveBeenCalledWith({
      session,
      isEphemeral: false,
      apiVersion: ApiVersion.create(ApiVersion.VERSIONS.v20200115).getValue(),
    })

    expect(result).toEqual({
      success: true,
      result: sessionCreationResult,
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should refresh a session token even if publishing domain event fails', async () => {
    domainEventPublisher.publish = jest.fn().mockRejectedValue(new Error('test'))

    const result = await createUseCase().execute({
      authTokenFromHeaders: '123',
      refreshTokenFromHeaders: '1:2:3',
      requestMetadata: { url: '/foobar', method: 'GET', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
      apiVersion: ApiVersion.VERSIONS.v20200115,
    })

    expect(sessionService.refreshTokens).toHaveBeenCalledWith({
      session,
      isEphemeral: false,
      apiVersion: ApiVersion.create(ApiVersion.VERSIONS.v20200115).getValue(),
    })

    expect(result).toEqual({
      success: true,
      result: sessionCreationResult,
    })
  })

  it('should not refresh a session token if session is not found', async () => {
    getSessionFromToken.execute = jest.fn().mockReturnValue(Result.fail('No session found.'))

    const result = await createUseCase().execute({
      authTokenFromHeaders: '123',
      refreshTokenFromHeaders: '234',
      requestMetadata: { url: '/foobar', method: 'GET', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
      apiVersion: ApiVersion.VERSIONS.v20200115,
    })

    expect(result).toEqual({
      success: false,
      errorTag: 'invalid-parameters',
      errorMessage: 'The provided parameters are not valid.',
    })
  })

  it('should not refresh a session token if refresh token is not valid', async () => {
    const result = await createUseCase().execute({
      authTokenFromHeaders: '123',
      refreshTokenFromHeaders: '2345',
      requestMetadata: { url: '/foobar', method: 'GET', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
      apiVersion: ApiVersion.VERSIONS.v20200115,
    })

    expect(result).toEqual({
      success: false,
      errorTag: 'invalid-refresh-token',
      errorMessage: 'The refresh token is not valid.',
    })
  })

  it('should not refresh a session if the session is cookies based and the refresh token is missing from cookies', async () => {
    session.version = SessionService.COOKIE_BASED_SESSION_VERSION
    getSessionFromToken.execute = jest.fn().mockReturnValue(Result.ok({ session, isEphemeral: false }))

    const result = await createUseCase().execute({
      authTokenFromHeaders: '1:2',
      refreshTokenFromHeaders: '2:3',
      authCookies: new Map([['access_token_2-3-4', ['1:2']]]),
      requestMetadata: { url: '/foobar', method: 'GET', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
      apiVersion: ApiVersion.VERSIONS.v20200115,
    })

    expect(result).toEqual({
      success: false,
      errorTag: 'invalid-refresh-token',
      errorMessage: 'The refresh token is not valid.',
    })
  })

  it('should not refresh a session token if refresh token is expired', async () => {
    timer.getUTCDate = jest.fn().mockReturnValue(new Date(200))

    const result = await createUseCase().execute({
      authTokenFromHeaders: '123',
      refreshTokenFromHeaders: '1:2:3',
      requestMetadata: { url: '/foobar', method: 'GET', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
      apiVersion: ApiVersion.VERSIONS.v20200115,
    })

    expect(result).toEqual({
      success: false,
      errorTag: 'expired-refresh-token',
      errorMessage: 'The refresh token has expired.',
    })
  })

  it('should not refresh a session token if the api version is invalid', async () => {
    const result = await createUseCase().execute({
      authTokenFromHeaders: '123',
      refreshTokenFromHeaders: '234',
      requestMetadata: { url: '/foobar', method: 'GET', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
      apiVersion: '',
    })

    expect(result).toEqual({
      success: false,
      errorTag: 'invalid-parameters',
      errorMessage: 'The provided parameters are not valid.',
    })
  })
})

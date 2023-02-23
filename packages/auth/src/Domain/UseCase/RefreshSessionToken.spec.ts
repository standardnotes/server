import 'reflect-metadata'

import { Session } from '../Session/Session'
import { SessionServiceInterface } from '../Session/SessionServiceInterface'
import { RefreshSessionToken } from './RefreshSessionToken'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { Logger } from 'winston'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'

describe('RefreshSessionToken', () => {
  let sessionService: SessionServiceInterface
  let session: Session
  let domainEventFactory: DomainEventFactoryInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let timer: TimerInterface
  let logger: Logger

  const createUseCase = () =>
    new RefreshSessionToken(sessionService, domainEventFactory, domainEventPublisher, timer, logger)

  beforeEach(() => {
    session = {} as jest.Mocked<Session>
    session.uuid = '1-2-3'
    session.refreshExpiration = new Date(123)

    sessionService = {} as jest.Mocked<SessionServiceInterface>
    sessionService.isRefreshTokenValid = jest.fn().mockReturnValue(true)
    sessionService.getSessionFromToken = jest.fn().mockReturnValue(session)
    sessionService.refreshTokens = jest.fn().mockReturnValue({
      access_token: 'token1',
      refresh_token: 'token2',
      access_expiration: 123,
      refresh_expiration: 234,
    })

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createSessionRefreshedEvent = jest.fn().mockReturnValue({})

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.getUTCDate = jest.fn().mockReturnValue(new Date(100))

    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()
  })

  it('should refresh session token', async () => {
    const result = await createUseCase().execute({
      accessToken: '123',
      refreshToken: '234',
    })

    expect(sessionService.refreshTokens).toHaveBeenCalledWith(session)

    expect(result).toEqual({
      success: true,
      sessionPayload: {
        access_token: 'token1',
        refresh_token: 'token2',
        access_expiration: 123,
        refresh_expiration: 234,
      },
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should refresh a session token even if publishing domain event fails', async () => {
    domainEventPublisher.publish = jest.fn().mockRejectedValue(new Error('test'))

    const result = await createUseCase().execute({
      accessToken: '123',
      refreshToken: '234',
    })

    expect(sessionService.refreshTokens).toHaveBeenCalledWith(session)

    expect(result).toEqual({
      success: true,
      sessionPayload: {
        access_token: 'token1',
        refresh_token: 'token2',
        access_expiration: 123,
        refresh_expiration: 234,
      },
    })
  })

  it('should not refresh a session token if session is not found', async () => {
    sessionService.getSessionFromToken = jest.fn().mockReturnValue(null)

    const result = await createUseCase().execute({
      accessToken: '123',
      refreshToken: '234',
    })

    expect(result).toEqual({
      success: false,
      errorTag: 'invalid-parameters',
      errorMessage: 'The provided parameters are not valid.',
    })
  })

  it('should not refresh a session token if refresh token is not valid', async () => {
    sessionService.isRefreshTokenValid = jest.fn().mockReturnValue(false)

    const result = await createUseCase().execute({
      accessToken: '123',
      refreshToken: '234',
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
      accessToken: '123',
      refreshToken: '234',
    })

    expect(result).toEqual({
      success: false,
      errorTag: 'expired-refresh-token',
      errorMessage: 'The refresh token has expired.',
    })
  })
})

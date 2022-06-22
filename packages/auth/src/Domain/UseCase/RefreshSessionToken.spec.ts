import 'reflect-metadata'
import * as dayjs from 'dayjs'

import { Session } from '../Session/Session'
import { SessionServiceInterface } from '../Session/SessionServiceInterface'
import { RefreshSessionToken } from './RefreshSessionToken'

describe('RefreshSessionToken', () => {
  let sessionService: SessionServiceInterface
  let session: Session

  const createUseCase = () => new RefreshSessionToken(sessionService)

  beforeEach(() => {
    session = {} as jest.Mocked<Session>
    session.uuid = '1-2-3'
    session.refreshExpiration = dayjs.utc().add(1, 'day').toDate()

    sessionService = {} as jest.Mocked<SessionServiceInterface>
    sessionService.isRefreshTokenValid = jest.fn().mockReturnValue(true)
    sessionService.getSessionFromToken = jest.fn().mockReturnValue(session)
    sessionService.refreshTokens = jest.fn().mockReturnValue({
      access_token: 'token1',
      refresh_token: 'token2',
      access_expiration: 123,
      refresh_expiration: 234,
    })
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
    session.refreshExpiration = dayjs.utc().subtract(1, 'day').toDate()

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

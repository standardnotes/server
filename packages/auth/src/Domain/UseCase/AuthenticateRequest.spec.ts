import 'reflect-metadata'

import * as winston from 'winston'

import { AuthenticateRequest } from './AuthenticateRequest'
import { Session } from '../Session/Session'
import { AuthenticateUser } from './AuthenticateUser'
import { User } from '../User/User'

describe('AuthenticateRequest', () => {
  let logger: winston.Logger
  let authenticateUser: AuthenticateUser

  const createUseCase = () => new AuthenticateRequest(authenticateUser, logger)

  beforeEach(() => {
    authenticateUser = {} as jest.Mocked<AuthenticateUser>
    authenticateUser.execute = jest.fn()

    logger = {} as jest.Mocked<winston.Logger>
    logger.info = jest.fn()
    logger.warn = jest.fn()
    logger.error = jest.fn()
    logger.debug = jest.fn()
  })

  it('should authorize request', async () => {
    const user = {} as jest.Mocked<User>
    const session = {} as jest.Mocked<Session>

    authenticateUser.execute = jest.fn().mockReturnValue({
      success: true,
      user,
      session,
    })

    const response = await createUseCase().execute({
      authTokenFromHeaders: 'test',
      requestMetadata: { url: '/foobar', method: 'GET' },
    })

    expect(response.success).toBeTruthy()
    expect(response.responseCode).toEqual(200)
    expect(response.user).toEqual(user)
    expect(response.session).toEqual(session)
  })

  it('should not authorize if authorization header is missing', async () => {
    const response = await createUseCase().execute({
      requestMetadata: { url: '/foobar', method: 'GET' },
    })

    expect(response.success).toBeFalsy()
    expect(response.responseCode).toEqual(401)
    expect(response.errorTag).toEqual('invalid-auth')
  })

  it('should not authorize if an error occurres', async () => {
    authenticateUser.execute = jest.fn().mockImplementation(() => {
      throw new Error('something bad happened')
    })

    const response = await createUseCase().execute({
      authTokenFromHeaders: 'test',
      requestMetadata: { url: '/foobar', method: 'GET' },
    })

    expect(response.success).toBeFalsy()
    expect(response.responseCode).toEqual(401)
    expect(response.errorTag).toEqual('invalid-auth')
  })

  it('should not authorize user if authentication fails', async () => {
    authenticateUser.execute = jest.fn().mockReturnValue({
      success: false,
      failureType: 'INVALID_AUTH',
    })

    const response = await createUseCase().execute({
      authTokenFromHeaders: 'test',
      requestMetadata: { url: '/foobar', method: 'GET' },
    })

    expect(response.success).toBeFalsy()
    expect(response.responseCode).toEqual(401)
    expect(response.errorTag).toEqual('invalid-auth')
  })

  it('should not authorize user if the token is expired', async () => {
    authenticateUser.execute = jest.fn().mockReturnValue({
      success: false,
      failureType: 'EXPIRED_TOKEN',
    })

    const response = await createUseCase().execute({
      authTokenFromHeaders: 'test',
      requestMetadata: { url: '/foobar', method: 'GET' },
    })

    expect(response.success).toBeFalsy()
    expect(response.responseCode).toEqual(498)
    expect(response.errorTag).toEqual('expired-access-token')
  })

  it('should not authorize user if the token is cooled down', async () => {
    authenticateUser.execute = jest.fn().mockReturnValue({
      success: false,
      failureType: 'COOLEDDOWN_TOKEN',
    })

    const response = await createUseCase().execute({
      authTokenFromHeaders: 'test',
      requestMetadata: { url: '/foobar', method: 'GET' },
    })

    expect(response.success).toBeFalsy()
    expect(response.responseCode).toEqual(498)
    expect(response.errorTag).toEqual('expired-access-token')
  })

  it('should not authorize user if the session is revoked', async () => {
    authenticateUser.execute = jest.fn().mockReturnValue({
      success: false,
      failureType: 'REVOKED_SESSION',
    })

    const response = await createUseCase().execute({
      authTokenFromHeaders: 'test',
      requestMetadata: { url: '/foobar', method: 'GET' },
    })

    expect(response.success).toBeFalsy()
    expect(response.responseCode).toEqual(401)
    expect(response.errorTag).toEqual('revoked-session')
  })
})

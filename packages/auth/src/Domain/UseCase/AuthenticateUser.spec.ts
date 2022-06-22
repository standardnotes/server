import 'reflect-metadata'
import * as dayjs from 'dayjs'

import { Session } from '../Session/Session'

import { User } from '../User/User'
import { AuthenticateUser } from './AuthenticateUser'
import { RevokedSession } from '../Session/RevokedSession'
import { AuthenticationMethodResolverInterface } from '../Auth/AuthenticationMethodResolverInterface'

describe('AuthenticateUser', () => {
  let user: User
  let session: Session
  let revokedSession: RevokedSession
  let authenticationMethodResolver: AuthenticationMethodResolverInterface

  const createUseCase = () => new AuthenticateUser(authenticationMethodResolver)

  beforeEach(() => {
    user = {} as jest.Mocked<User>
    user.supportsSessions = jest.fn().mockReturnValue(false)

    session = {} as jest.Mocked<Session>
    session.accessExpiration = dayjs.utc().add(1, 'day').toDate()
    session.refreshExpiration = dayjs.utc().add(1, 'day').toDate()

    revokedSession = {} as jest.Mocked<RevokedSession>
    revokedSession.uuid = '1-2-3'

    authenticationMethodResolver = {} as jest.Mocked<AuthenticationMethodResolverInterface>
    authenticationMethodResolver.resolve = jest.fn()
  })

  it('should authenticate a user based on a JWT token', async () => {
    user.encryptedPassword = 'test'

    authenticationMethodResolver.resolve = jest.fn().mockReturnValue({
      type: 'jwt',
      claims: {
        pw_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      },
      user,
    })

    const response = await createUseCase().execute({ token: 'test' })

    expect(response.success).toBeTruthy()
  })

  it('should not authenticate a user if the password hashed in JWT token is inavlid', async () => {
    user.encryptedPassword = 'test2'

    authenticationMethodResolver.resolve = jest.fn().mockReturnValue({
      type: 'jwt',
      claims: {
        pw_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      },
      user,
    })

    const response = await createUseCase().execute({ token: 'test' })

    expect(response.success).toBeFalsy()
  })

  it('should not authenticate a user if the user is from JWT token is not found', async () => {
    authenticationMethodResolver.resolve = jest.fn().mockReturnValue({
      type: 'jwt',
      claims: {
        pw_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      },
    })

    const response = await createUseCase().execute({ token: 'test' })

    expect(response.success).toBeFalsy()
  })

  it('should not authenticate a user if the user from JWT token supports sessions', async () => {
    user.supportsSessions = jest.fn().mockReturnValue(true)

    authenticationMethodResolver.resolve = jest.fn().mockReturnValue({
      type: 'jwt',
      claims: {
        pw_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      },
      user,
    })

    const response = await createUseCase().execute({ token: 'test' })

    expect(response.success).toBeFalsy()
  })

  it('should authenticate a user from a session token', async () => {
    user.supportsSessions = jest.fn().mockReturnValue(true)

    authenticationMethodResolver.resolve = jest.fn().mockReturnValue({
      type: 'session_token',
      session,
      user,
    })

    const response = await createUseCase().execute({ token: 'test' })

    expect(response.success).toBeTruthy()
  })

  it('should not authenticate a user from a session token if session is expired', async () => {
    session.accessExpiration = dayjs.utc().subtract(1, 'day').toDate()
    user.supportsSessions = jest.fn().mockReturnValue(true)

    authenticationMethodResolver.resolve = jest.fn().mockReturnValue({
      type: 'session_token',
      session,
      user,
    })

    const response = await createUseCase().execute({ token: 'test' })

    expect(response.success).toBeFalsy()
  })

  it('should not authenticate a user from a session token if refresh token is expired', async () => {
    session.refreshExpiration = dayjs.utc().subtract(1, 'day').toDate()
    user.supportsSessions = jest.fn().mockReturnValue(true)

    authenticationMethodResolver.resolve = jest.fn().mockReturnValue({
      type: 'session_token',
      session,
      user,
    })

    const response = await createUseCase().execute({ token: 'test' })

    expect(response.success).toBeFalsy()
  })

  it('should not authenticate a user from a session token if session is not found', async () => {
    user.supportsSessions = jest.fn().mockReturnValue(true)

    authenticationMethodResolver.resolve = jest.fn().mockReturnValue({
      type: 'session_token',
      user,
    })

    const response = await createUseCase().execute({ token: 'test' })

    expect(response.success).toBeFalsy()
  })

  it('should not authenticate a user if a session is revoked', async () => {
    authenticationMethodResolver.resolve = jest.fn().mockReturnValue({
      type: 'revoked',
      revokedSession,
    })

    const response = await createUseCase().execute({ token: 'test' })

    expect(response.success).toBeFalsy()
  })

  it('should not authenticate a user if authentication method could not be determined', async () => {
    authenticationMethodResolver.resolve = jest.fn().mockReturnValue(undefined)

    const response = await createUseCase().execute({ token: 'test' })

    expect(response.success).toBeFalsy()
  })
})

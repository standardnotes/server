import 'reflect-metadata'

import { AuthMiddleware } from './AuthMiddleware'
import { NextFunction, Request, Response } from 'express'
import { User } from '../Domain/User/User'
import { AuthenticateRequest } from '../Domain/UseCase/AuthenticateRequest'
import { Session } from '../Domain/Session/Session'
import { Logger } from 'winston'

describe('AuthMiddleware', () => {
  let authenticateRequest: AuthenticateRequest
  let request: Request
  let response: Response
  let next: NextFunction

  const logger = {
    debug: jest.fn(),
  } as unknown as jest.Mocked<Logger>

  const createMiddleware = () => new AuthMiddleware(authenticateRequest, logger)

  beforeEach(() => {
    authenticateRequest = {} as jest.Mocked<AuthenticateRequest>
    authenticateRequest.execute = jest.fn()

    request = {
      headers: {},
    } as jest.Mocked<Request>
    response = {
      locals: {},
    } as jest.Mocked<Response>
    response.status = jest.fn().mockReturnThis()
    response.send = jest.fn()
    next = jest.fn()
  })

  it('should authorize user', async () => {
    const user = {} as jest.Mocked<User>
    const session = {} as jest.Mocked<Session>
    authenticateRequest.execute = jest.fn().mockReturnValue({
      success: true,
      user,
      session,
    })

    await createMiddleware().handler(request, response, next)

    expect(response.locals.user).toEqual(user)
    expect(response.locals.session).toEqual(session)

    expect(next).toHaveBeenCalled()
  })

  it('should not authorize if request authentication fails', async () => {
    authenticateRequest.execute = jest.fn().mockReturnValue({
      success: false,
      responseCode: 401,
    })

    await createMiddleware().handler(request, response, next)

    expect(response.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('should pass the error to next middleware if one occurres', async () => {
    const error = new Error('Ooops')

    authenticateRequest.execute = jest.fn().mockImplementation(() => {
      throw error
    })

    await createMiddleware().handler(request, response, next)

    expect(response.status).not.toHaveBeenCalled()

    expect(next).toHaveBeenCalledWith(error)
  })
})

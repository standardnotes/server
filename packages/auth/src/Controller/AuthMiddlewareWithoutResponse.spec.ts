import 'reflect-metadata'

import { AuthMiddlewareWithoutResponse } from './AuthMiddlewareWithoutResponse'
import { NextFunction, Request, Response } from 'express'
import { User } from '../Domain/User/User'
import { AuthenticateRequest } from '../Domain/UseCase/AuthenticateRequest'
import { Session } from '../Domain/Session/Session'

describe('AuthMiddlewareWithoutResponse', () => {
  let authenticateRequest: AuthenticateRequest
  let request: Request
  let response: Response
  let next: NextFunction

  const createMiddleware = () => new AuthMiddlewareWithoutResponse(authenticateRequest)

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

  it('should skip middleware if authentication fails', async () => {
    authenticateRequest.execute = jest.fn().mockReturnValue({
      success: false,
    })

    await createMiddleware().handler(request, response, next)

    expect(next).toHaveBeenCalled()
  })

  it('should skip middleware if authentication errors', async () => {
    authenticateRequest.execute = jest.fn().mockImplementation(() => {
      throw new Error('Ooops')
    })

    await createMiddleware().handler(request, response, next)

    expect(next).toHaveBeenCalled()
  })
})

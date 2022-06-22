import 'reflect-metadata'

import { ApiGatewayAuthMiddleware } from './ApiGatewayAuthMiddleware'
import { NextFunction, Request, Response } from 'express'
import { Logger } from 'winston'
import { CrossServiceTokenData, TokenDecoderInterface } from '@standardnotes/auth'
import { RoleName } from '@standardnotes/common'

describe('ApiGatewayAuthMiddleware', () => {
  let tokenDecoder: TokenDecoderInterface<CrossServiceTokenData>
  let request: Request
  let response: Response
  let next: NextFunction

  const logger = {
    debug: jest.fn(),
  } as unknown as jest.Mocked<Logger>

  const createMiddleware = () => new ApiGatewayAuthMiddleware(tokenDecoder, logger)

  beforeEach(() => {
    tokenDecoder = {} as jest.Mocked<TokenDecoderInterface<CrossServiceTokenData>>
    tokenDecoder.decodeToken = jest.fn().mockReturnValue({
      user: {
        uuid: '1-2-3',
        email: 'test@test.te',
      },
      roles: [
        {
          uuid: 'a-b-c',
          name: RoleName.CoreUser,
        },
      ],
    })

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
    request.headers['x-auth-token'] = 'auth-jwt-token'

    await createMiddleware().handler(request, response, next)

    expect(response.locals.user).toEqual({
      uuid: '1-2-3',
      email: 'test@test.te',
    })
    expect(response.locals.roles).toEqual([
      {
        uuid: 'a-b-c',
        name: RoleName.CoreUser,
      },
    ])

    expect(next).toHaveBeenCalled()
  })

  it('should not authorize if request is missing auth jwt token in headers', async () => {
    await createMiddleware().handler(request, response, next)

    expect(response.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('should not authorize if auth jwt token is malformed', async () => {
    request.headers['x-auth-token'] = 'auth-jwt-token'

    tokenDecoder.decodeToken = jest.fn().mockReturnValue(undefined)

    await createMiddleware().handler(request, response, next)

    expect(response.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('should pass the error to next middleware if one occurres', async () => {
    request.headers['x-auth-token'] = 'auth-jwt-token'

    const error = new Error('Ooops')

    tokenDecoder.decodeToken = jest.fn().mockImplementation(() => {
      throw error
    })

    await createMiddleware().handler(request, response, next)

    expect(response.status).not.toHaveBeenCalled()

    expect(next).toHaveBeenCalledWith(error)
  })
})

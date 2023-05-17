import 'reflect-metadata'

import { ApiGatewayOfflineAuthMiddleware } from './ApiGatewayOfflineAuthMiddleware'
import { NextFunction, Request, Response } from 'express'
import { Logger } from 'winston'
import { OfflineUserTokenData, TokenDecoderInterface } from '@standardnotes/security'

describe('ApiGatewayOfflineAuthMiddleware', () => {
  let tokenDecoder: TokenDecoderInterface<OfflineUserTokenData>
  let request: Request
  let response: Response
  let next: NextFunction

  const logger = {
    debug: jest.fn(),
  } as unknown as jest.Mocked<Logger>

  const createMiddleware = () => new ApiGatewayOfflineAuthMiddleware(tokenDecoder, logger)

  beforeEach(() => {
    tokenDecoder = {} as jest.Mocked<TokenDecoderInterface<OfflineUserTokenData>>
    tokenDecoder.decodeToken = jest.fn().mockReturnValue({
      userEmail: 'test@test.te',
      featuresToken: 'abc',
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
    request.headers['x-auth-offline-token'] = 'auth-jwt-token'

    await createMiddleware().handler(request, response, next)

    expect(response.locals.userEmail).toEqual('test@test.te')
    expect(response.locals.featuresToken).toEqual('abc')

    expect(next).toHaveBeenCalled()
  })

  it('should not authorize if request is missing auth jwt token in headers', async () => {
    await createMiddleware().handler(request, response, next)

    expect(response.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('should not authorize if auth jwt token is malformed', async () => {
    request.headers['x-auth-offline-token'] = 'auth-jwt-token'

    tokenDecoder.decodeToken = jest.fn().mockReturnValue(undefined)

    await createMiddleware().handler(request, response, next)

    expect(response.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('should pass the error to next middleware if one occurres', async () => {
    request.headers['x-auth-offline-token'] = 'auth-jwt-token'

    const error = new Error('Ooops')

    tokenDecoder.decodeToken = jest.fn().mockImplementation(() => {
      throw error
    })

    await createMiddleware().handler(request, response, next)

    expect(response.status).not.toHaveBeenCalled()

    expect(next).toHaveBeenCalledWith(error)
  })
})

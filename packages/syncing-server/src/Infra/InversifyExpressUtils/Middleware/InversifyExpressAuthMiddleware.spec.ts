import 'reflect-metadata'

import * as winston from 'winston'

import { InversifyExpressAuthMiddleware } from './InversifyExpressAuthMiddleware'
import { NextFunction, Request, Response } from 'express'
import { sign } from 'jsonwebtoken'
import { RoleName } from '@standardnotes/domain-core'

describe('InversifyExpressAuthMiddleware', () => {
  let logger: winston.Logger
  const jwtSecret = 'auth_jwt_secret'
  let request: Request
  let response: Response
  let next: NextFunction

  const createMiddleware = () => new InversifyExpressAuthMiddleware(jwtSecret, logger)

  beforeEach(() => {
    logger = {} as jest.Mocked<winston.Logger>
    logger.info = jest.fn()
    logger.debug = jest.fn()
    logger.warn = jest.fn()
    logger.error = jest.fn()

    request = {
      headers: {},
    } as jest.Mocked<Request>
    request.header = jest.fn()
    response = {
      locals: {},
    } as jest.Mocked<Response>
    response.status = jest.fn().mockReturnThis()
    response.send = jest.fn()
    next = jest.fn()
  })

  it('should authorize a paid user from an auth JWT token if present', async () => {
    const authToken = sign(
      {
        user: { uuid: '123' },
        session: { uuid: '234' },
        roles: [
          {
            uuid: '1-2-3',
            name: RoleName.NAMES.CoreUser,
          },
          {
            uuid: '2-3-4',
            name: RoleName.NAMES.ProUser,
          },
        ],
        permissions: [],
      },
      jwtSecret,
      { algorithm: 'HS256' },
    )

    request.header = jest.fn().mockReturnValue(authToken)

    await createMiddleware().handler(request, response, next)

    expect(response.locals.user).toEqual({ uuid: '123' })
    expect(response.locals.roleNames).toEqual(['CORE_USER', 'PRO_USER'])
    expect(response.locals.session).toEqual({ uuid: '234' })
    expect(response.locals.readOnlyAccess).toBeFalsy()
    expect(response.locals.freeUser).toEqual(false)

    expect(next).toHaveBeenCalled()
  })

  it('should authorize a free user from an auth JWT token if present', async () => {
    const authToken = sign(
      {
        user: { uuid: '123' },
        session: { uuid: '234' },
        roles: [
          {
            uuid: '1-2-3',
            name: RoleName.NAMES.CoreUser,
          },
        ],
        permissions: [],
      },
      jwtSecret,
      { algorithm: 'HS256' },
    )

    request.header = jest.fn().mockReturnValue(authToken)

    await createMiddleware().handler(request, response, next)

    expect(response.locals.freeUser).toEqual(true)

    expect(next).toHaveBeenCalled()
  })

  it('should authorize user from an auth JWT token if present with read only access', async () => {
    const authToken = sign(
      {
        user: { uuid: '123' },
        session: {
          uuid: '234',
          readonly_access: true,
        },
        roles: [
          {
            uuid: '1-2-3',
            name: RoleName.NAMES.CoreUser,
          },
          {
            uuid: '2-3-4',
            name: RoleName.NAMES.ProUser,
          },
        ],
        permissions: [],
      },
      jwtSecret,
      { algorithm: 'HS256' },
    )

    request.header = jest.fn().mockReturnValue(authToken)

    await createMiddleware().handler(request, response, next)

    expect(response.locals.user).toEqual({ uuid: '123' })
    expect(response.locals.roleNames).toEqual(['CORE_USER', 'PRO_USER'])
    expect(response.locals.session).toEqual({ uuid: '234', readonly_access: true })
    expect(response.locals.readOnlyAccess).toBeTruthy()

    expect(next).toHaveBeenCalled()
  })

  it('should not authorize user from an auth JWT token if it is invalid', async () => {
    const authToken = sign(
      {
        user: { uuid: '123' },
        session: { uuid: '234' },
        roles: [],
        permissions: [],
      },
      jwtSecret,
      { algorithm: 'HS256', notBefore: '2 days' },
    )

    request.header = jest.fn().mockReturnValue(authToken)

    await createMiddleware().handler(request, response, next)

    expect(response.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('should not authorize if authorization header is missing', async () => {
    await createMiddleware().handler(request, response, next)

    expect(response.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })
})

import 'reflect-metadata'

import { NextFunction, Request, Response } from 'express'

import { AdminKeyMiddleware } from './AdminKeyMiddleware'

describe('AdminKeyMiddleware', () => {
  let request: Request
  let response: Response
  let next: NextFunction

  const createMiddleware = (adminKey = 'correct-key') => new AdminKeyMiddleware(adminKey)

  beforeEach(() => {
    request = {
      headers: {},
    } as jest.Mocked<Request>
    response = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as jest.Mocked<Response>
    next = jest.fn()
  })

  it('should authorize when key is provided in x-admin-key header', () => {
    request.headers['x-admin-key'] = 'correct-key'

    createMiddleware().handler(request, response, next)

    expect(next).toHaveBeenCalled()
    expect(response.status).not.toHaveBeenCalled()
  })

  it('should not authorize when key is missing', () => {
    createMiddleware().handler(request, response, next)

    expect(response.status).toHaveBeenCalledWith(404)
    expect(response.send).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('should not authorize when key is incorrect', () => {
    request.headers['x-admin-key'] = 'wrong-key'

    createMiddleware().handler(request, response, next)

    expect(response.status).toHaveBeenCalledWith(404)
    expect(response.send).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('should authorize when admin key is not configured', () => {
    createMiddleware('').handler(request, response, next)

    expect(next).toHaveBeenCalled()
    expect(response.status).not.toHaveBeenCalled()
  })
})

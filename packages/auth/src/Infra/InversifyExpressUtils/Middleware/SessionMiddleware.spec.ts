import 'reflect-metadata'

import { SessionMiddleware } from './SessionMiddleware'
import { NextFunction, Request, Response } from 'express'

describe('SessionMiddleware', () => {
  let request: Request
  let response: Response
  let next: NextFunction

  const createMiddleware = () => new SessionMiddleware()

  beforeEach(() => {
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

  it('should do nothing if session is available', async () => {
    response.locals.session = {}

    await createMiddleware().handler(request, response, next)

    expect(next).toHaveBeenCalled()
  })

  it('should send bad request error if session is not available', async () => {
    await createMiddleware().handler(request, response, next)

    expect(response.status).toHaveBeenCalledWith(400)

    expect(next).not.toHaveBeenCalled()
  })

  it('should pass the error to next middleware if one occurres', async () => {
    const error = new Error('Ooops')

    response.send = jest.fn().mockImplementation(() => {
      throw error
    })

    await createMiddleware().handler(request, response, next)

    expect(next).toHaveBeenCalledWith(error)
  })
})

import 'reflect-metadata'

import { ValetTokenAuthMiddleware } from './ValetTokenAuthMiddleware'
import { NextFunction, Request, Response } from 'express'
import { Logger } from 'winston'
import { TokenDecoderInterface, ValetTokenData } from '@standardnotes/security'

describe('ValetTokenAuthMiddleware', () => {
  let tokenDecoder: TokenDecoderInterface<ValetTokenData>
  let request: Request
  let response: Response
  let next: NextFunction

  const logger = {
    debug: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<Logger>

  const createMiddleware = () => new ValetTokenAuthMiddleware(tokenDecoder, logger)

  beforeEach(() => {
    tokenDecoder = {} as jest.Mocked<TokenDecoderInterface<ValetTokenData>>
    tokenDecoder.decodeToken = jest.fn().mockReturnValue({
      userUuid: '1-2-3',
      permittedResources: [
        {
          remoteIdentifier: '00000000-0000-0000-0000-000000000000',
          unencryptedFileSize: 30,
        },
      ],
      permittedOperation: 'write',
      uploadBytesLimit: 100,
      uploadBytesUsed: 80,
    })

    request = {
      headers: {},
      query: {},
      body: {},
    } as jest.Mocked<Request>
    response = {
      locals: {},
    } as jest.Mocked<Response>
    response.status = jest.fn().mockReturnThis()
    response.send = jest.fn()
    next = jest.fn()
  })

  it('should authorize user with a valet token', async () => {
    tokenDecoder.decodeToken = jest.fn().mockReturnValue({
      userUuid: '1-2-3',
      permittedResources: [
        {
          remoteIdentifier: '00000000-0000-0000-0000-000000000000',
          unencryptedFileSize: 30,
        },
      ],
      permittedOperation: 'write',
      uploadBytesLimit: -1,
      uploadBytesUsed: 80,
    })

    request.headers['x-valet-token'] = 'valet-token'

    await createMiddleware().handler(request, response, next)

    expect(response.locals).toEqual({
      userUuid: '1-2-3',
      permittedOperation: 'write',
      permittedResources: [
        {
          remoteIdentifier: '00000000-0000-0000-0000-000000000000',
          unencryptedFileSize: 30,
        },
      ],
      uploadBytesLimit: -1,
      uploadBytesUsed: 80,
    })

    expect(next).toHaveBeenCalled()
  })

  it('should authorize user with unlimited upload with a valet token', async () => {
    request.headers['x-valet-token'] = 'valet-token'
    tokenDecoder.decodeToken = jest.fn().mockReturnValue({
      userUuid: '1-2-3',
      permittedResources: [
        {
          remoteIdentifier: '00000000-0000-0000-0000-000000000000',
          unencryptedFileSize: 10,
        },
      ],
      permittedOperation: 'write',
      uploadBytesLimit: -1,
      uploadBytesUsed: 80,
    })

    await createMiddleware().handler(request, response, next)

    expect(response.locals).toEqual({
      userUuid: '1-2-3',
      permittedOperation: 'write',
      permittedResources: [
        {
          remoteIdentifier: '00000000-0000-0000-0000-000000000000',
          unencryptedFileSize: 10,
        },
      ],
      uploadBytesLimit: -1,
      uploadBytesUsed: 80,
    })

    expect(next).toHaveBeenCalled()
  })

  it('should not authorize user with no space left for upload', async () => {
    request.headers['x-valet-token'] = 'valet-token'
    tokenDecoder.decodeToken = jest.fn().mockReturnValue({
      userUuid: '1-2-3',
      permittedResources: [
        {
          remoteIdentifier: '00000000-0000-0000-0000-000000000000',
          unencryptedFileSize: 21,
        },
      ],
      permittedOperation: 'write',
      uploadBytesLimit: 100,
      uploadBytesUsed: 80,
    })

    await createMiddleware().handler(request, response, next)

    expect(response.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('should authorize user with no space left for upload for download operations', async () => {
    request.headers['x-valet-token'] = 'valet-token'

    tokenDecoder.decodeToken = jest.fn().mockReturnValue({
      userUuid: '1-2-3',
      permittedResources: [
        {
          remoteIdentifier: '00000000-0000-0000-0000-000000000000',
          unencryptedFileSize: 21,
        },
      ],
      permittedOperation: 'read',
      uploadBytesLimit: 100,
      uploadBytesUsed: 80,
    })

    await createMiddleware().handler(request, response, next)

    expect(response.locals).toEqual({
      userUuid: '1-2-3',
      permittedOperation: 'read',
      permittedResources: [
        {
          remoteIdentifier: '00000000-0000-0000-0000-000000000000',
          unencryptedFileSize: 21,
        },
      ],
      uploadBytesLimit: 100,
      uploadBytesUsed: 80,
    })

    expect(next).toHaveBeenCalled()
  })

  it('should not authorize if request is missing valet token in headers', async () => {
    await createMiddleware().handler(request, response, next)

    expect(response.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('should not authorize if valet token has an invalid remote resource identifier', async () => {
    tokenDecoder.decodeToken = jest.fn().mockReturnValue({
      userUuid: '1-2-3',
      permittedResources: [
        {
          remoteIdentifier: '1-2-3',
          unencryptedFileSize: 30,
        },
      ],
      permittedOperation: 'write',
      uploadBytesLimit: -1,
      uploadBytesUsed: 80,
    })

    request.headers['x-valet-token'] = 'valet-token'

    await createMiddleware().handler(request, response, next)

    expect(response.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('should not authorize if auth valet token is malformed', async () => {
    request.headers['x-valet-token'] = 'valet-token'

    tokenDecoder.decodeToken = jest.fn().mockReturnValue(undefined)

    await createMiddleware().handler(request, response, next)

    expect(response.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('should pass the error to next middleware if one occurres', async () => {
    request.headers['x-valet-token'] = 'valet-token'

    const error = new Error('Ooops')

    tokenDecoder.decodeToken = jest.fn().mockImplementation(() => {
      throw error
    })

    await createMiddleware().handler(request, response, next)

    expect(response.status).not.toHaveBeenCalled()

    expect(next).toHaveBeenCalledWith(error)
  })

  it('should throw an error if the valet token indicates an ongoing transition', async () => {
    request.headers['x-valet-token'] = 'valet-token'

    tokenDecoder.decodeToken = jest.fn().mockReturnValue({
      userUuid: '1-2-3',
      permittedResources: [
        {
          remoteIdentifier: '00000000-0000-0000-0000-000000000000',
          unencryptedFileSize: 30,
        },
      ],
      permittedOperation: 'write',
      uploadBytesLimit: -1,
      uploadBytesUsed: 80,
      ongoingTransition: true,
    })

    await createMiddleware().handler(request, response, next)

    expect(response.status).toHaveBeenCalledWith(500)
    expect(next).not.toHaveBeenCalled()
  })
})

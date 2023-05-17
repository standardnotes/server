import 'reflect-metadata'

import { OfflineUserAuthMiddleware } from './OfflineUserAuthMiddleware'
import { NextFunction, Request, Response } from 'express'
import { Logger } from 'winston'
import { OfflineSettingRepositoryInterface } from '../../../Domain/Setting/OfflineSettingRepositoryInterface'
import { OfflineSetting } from '../../../Domain/Setting/OfflineSetting'

describe('OfflineUserAuthMiddleware', () => {
  let offlineSettingRepository: OfflineSettingRepositoryInterface
  let offlineSetting: OfflineSetting
  let request: Request
  let response: Response
  let next: NextFunction

  const logger = {
    debug: jest.fn(),
  } as unknown as jest.Mocked<Logger>

  const createMiddleware = () => new OfflineUserAuthMiddleware(offlineSettingRepository, logger)

  beforeEach(() => {
    offlineSetting = {
      email: 'test@test.com',
      value: 'offline-features-token',
    } as jest.Mocked<OfflineSetting>

    offlineSettingRepository = {} as jest.Mocked<OfflineSettingRepositoryInterface>
    offlineSettingRepository.findOneByNameAndValue = jest.fn().mockReturnValue(offlineSetting)

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
    request.headers['x-offline-token'] = 'offline-features-token'

    await createMiddleware().handler(request, response, next)

    expect(response.locals.offlineUserEmail).toEqual('test@test.com')
    expect(response.locals.offlineFeaturesToken).toEqual('offline-features-token')

    expect(next).toHaveBeenCalled()
  })

  it('should not authorize if request is missing offline token in headers', async () => {
    await createMiddleware().handler(request, response, next)

    expect(response.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('should not authorize if offline token setting is not found', async () => {
    request.headers['x-offline-token'] = 'offline-features-token'

    offlineSettingRepository.findOneByNameAndValue = jest.fn().mockReturnValue(null)

    await createMiddleware().handler(request, response, next)

    expect(response.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('should pass the error to next middleware if one occurres', async () => {
    request.headers['x-offline-token'] = 'offline-features-token'

    const error = new Error('Ooops')

    offlineSettingRepository.findOneByNameAndValue = jest.fn().mockImplementation(() => {
      throw error
    })

    await createMiddleware().handler(request, response, next)

    expect(response.status).not.toHaveBeenCalled()

    expect(next).toHaveBeenCalledWith(error)
  })
})

import 'reflect-metadata'

import * as express from 'express'

import { InversifyExpressInternalController } from './InversifyExpressInternalController'
import { results } from 'inversify-express-utils'
import { User } from '../../Domain/User/User'
import { GetUserFeatures } from '../../Domain/UseCase/GetUserFeatures/GetUserFeatures'
import { GetSetting } from '../../Domain/UseCase/GetSetting/GetSetting'

describe('InversifyExpressInternalController', () => {
  let getUserFeatures: GetUserFeatures
  let getSetting: GetSetting

  let request: express.Request
  let response: express.Response
  let user: User

  const createController = () => new InversifyExpressInternalController(getUserFeatures, getSetting)

  beforeEach(() => {
    user = {} as jest.Mocked<User>
    user.uuid = '123'

    getUserFeatures = {} as jest.Mocked<GetUserFeatures>
    getUserFeatures.execute = jest.fn()

    getSetting = {} as jest.Mocked<GetSetting>
    getSetting.execute = jest.fn()

    request = {
      headers: {},
      body: {},
      params: {},
    } as jest.Mocked<express.Request>

    response = {} as jest.Mocked<express.Response>
    response.setHeader = jest.fn()
    response.status = jest.fn().mockReturnThis()
    response.send = jest.fn()
  })

  it('should get user features', async () => {
    request.params.userUuid = '1-2-3'

    getUserFeatures.execute = jest.fn().mockReturnValue({ success: true })

    const httpResponse = <results.JsonResult>await createController().getFeatures(request)
    const result = await httpResponse.executeAsync()

    expect(getUserFeatures.execute).toHaveBeenCalledWith({
      userUuid: '1-2-3',
      offline: false,
    })

    expect(result.statusCode).toEqual(200)
  })

  it('should not get user features if the user with provided uuid does not exist', async () => {
    request.params.userUuid = '1-2-3'

    getUserFeatures.execute = jest.fn().mockReturnValue({ success: false })

    const httpResponse = <results.JsonResult>await createController().getFeatures(request)
    const result = await httpResponse.executeAsync()

    expect(getUserFeatures.execute).toHaveBeenCalledWith({ userUuid: '1-2-3', offline: false })

    expect(result.statusCode).toEqual(400)
  })

  it('should get user setting', async () => {
    request.params.userUuid = '1-2-3'
    request.params.settingName = 'foobar'

    getSetting.execute = jest.fn().mockReturnValue({ success: true })

    const httpResponse = <results.JsonResult>await createController().getSetting(request)
    const result = await httpResponse.executeAsync()

    expect(getSetting.execute).toHaveBeenCalledWith({
      userUuid: '1-2-3',
      settingName: 'foobar',
      allowSensitiveRetrieval: true,
    })

    expect(result.statusCode).toEqual(200)
  })

  it('should not get user setting if the use case fails', async () => {
    request.params.userUuid = '1-2-3'
    request.params.settingName = 'foobar'

    getSetting.execute = jest.fn().mockReturnValue({ success: false })

    const httpResponse = <results.JsonResult>await createController().getSetting(request)
    const result = await httpResponse.executeAsync()

    expect(getSetting.execute).toHaveBeenCalledWith({
      userUuid: '1-2-3',
      settingName: 'foobar',
      allowSensitiveRetrieval: true,
    })

    expect(result.statusCode).toEqual(400)
  })
})

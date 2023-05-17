import 'reflect-metadata'

import * as express from 'express'

import { results } from 'inversify-express-utils'
import { InversifyExpressSubscriptionSettingsController } from './InversifyExpressSubscriptionSettingsController'
import { ControllerContainerInterface } from '@standardnotes/domain-core'
import { User } from '../../Domain/User/User'
import { GetSetting } from '../../Domain/UseCase/GetSetting/GetSetting'

describe('InversifyExpressSubscriptionSettingsController', () => {
  let getSetting: GetSetting

  let request: express.Request
  let response: express.Response
  let user: User
  let controllerContainer: ControllerContainerInterface

  const createController = () => new InversifyExpressSubscriptionSettingsController(getSetting, controllerContainer)

  beforeEach(() => {
    controllerContainer = {} as jest.Mocked<ControllerContainerInterface>
    controllerContainer.register = jest.fn()

    user = {} as jest.Mocked<User>
    user.uuid = '123'

    getSetting = {} as jest.Mocked<GetSetting>
    getSetting.execute = jest.fn()

    request = {
      headers: {},
      body: {},
      params: {},
    } as jest.Mocked<express.Request>

    response = {
      locals: {},
    } as jest.Mocked<express.Response>
  })

  it('should get subscription setting', async () => {
    request.params.userUuid = '1-2-3'
    request.params.subscriptionSettingName = 'test'
    response.locals.user = {
      uuid: '1-2-3',
    }

    getSetting.execute = jest.fn().mockReturnValue({ success: true })

    const httpResponse = <results.JsonResult>await createController().getSubscriptionSetting(request, response)
    const result = await httpResponse.executeAsync()

    expect(getSetting.execute).toHaveBeenCalledWith({ userUuid: '1-2-3', settingName: 'TEST' })

    expect(result.statusCode).toEqual(200)
  })

  it('should fail if could not get subscription setting', async () => {
    request.params.userUuid = '1-2-3'
    request.params.subscriptionSettingName = 'test'
    response.locals.user = {
      uuid: '1-2-3',
    }

    getSetting.execute = jest.fn().mockReturnValue({ success: false })

    const httpResponse = <results.JsonResult>await createController().getSubscriptionSetting(request, response)
    const result = await httpResponse.executeAsync()

    expect(getSetting.execute).toHaveBeenCalledWith({ userUuid: '1-2-3', settingName: 'TEST' })

    expect(result.statusCode).toEqual(400)
  })
})

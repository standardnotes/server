import 'reflect-metadata'

import * as express from 'express'

import { results } from 'inversify-express-utils'
import { User } from '../Domain/User/User'
import { GetSubscriptionSetting } from '../Domain/UseCase/GetSubscriptionSetting/GetSubscriptionSetting'
import { SubscriptionSettingsController } from './SubscriptionSettingsController'

describe('SubscriptionSettingsController', () => {
  let getSubscriptionSetting: GetSubscriptionSetting

  let request: express.Request
  let response: express.Response
  let user: User

  const createController = () => new SubscriptionSettingsController(getSubscriptionSetting)

  beforeEach(() => {
    user = {} as jest.Mocked<User>
    user.uuid = '123'

    getSubscriptionSetting = {} as jest.Mocked<GetSubscriptionSetting>
    getSubscriptionSetting.execute = jest.fn()

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

    getSubscriptionSetting.execute = jest.fn().mockReturnValue({ success: true })

    const httpResponse = <results.JsonResult>await createController().getSubscriptionSetting(request, response)
    const result = await httpResponse.executeAsync()

    expect(getSubscriptionSetting.execute).toHaveBeenCalledWith({ userUuid: '1-2-3', subscriptionSettingName: 'test' })

    expect(result.statusCode).toEqual(200)
  })

  it('should fail if could not get subscription setting', async () => {
    request.params.userUuid = '1-2-3'
    request.params.subscriptionSettingName = 'test'
    response.locals.user = {
      uuid: '1-2-3',
    }

    getSubscriptionSetting.execute = jest.fn().mockReturnValue({ success: false })

    const httpResponse = <results.JsonResult>await createController().getSubscriptionSetting(request, response)
    const result = await httpResponse.executeAsync()

    expect(getSubscriptionSetting.execute).toHaveBeenCalledWith({ userUuid: '1-2-3', subscriptionSettingName: 'test' })

    expect(result.statusCode).toEqual(400)
  })
})

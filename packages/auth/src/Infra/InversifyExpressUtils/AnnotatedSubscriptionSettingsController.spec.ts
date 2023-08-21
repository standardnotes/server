import 'reflect-metadata'

import * as express from 'express'

import { results } from 'inversify-express-utils'
import { AnnotatedSubscriptionSettingsController } from './AnnotatedSubscriptionSettingsController'
import { User } from '../../Domain/User/User'
import { GetSetting } from '../../Domain/UseCase/GetSetting/GetSetting'
import { Result } from '@standardnotes/domain-core'

describe('AnnotatedSubscriptionSettingsController', () => {
  let getSetting: GetSetting

  let request: express.Request
  let response: express.Response
  let user: User

  const createController = () => new AnnotatedSubscriptionSettingsController(getSetting)

  beforeEach(() => {
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

    getSetting.execute = jest.fn().mockReturnValue(Result.ok())

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

    getSetting.execute = jest.fn().mockReturnValue(Result.fail('Oops'))

    const httpResponse = <results.JsonResult>await createController().getSubscriptionSetting(request, response)
    const result = await httpResponse.executeAsync()

    expect(getSetting.execute).toHaveBeenCalledWith({ userUuid: '1-2-3', settingName: 'TEST' })

    expect(result.statusCode).toEqual(400)
  })
})

import 'reflect-metadata'

import * as express from 'express'

import { InversifyExpressSettingsController } from './InversifyExpressSettingsController'
import { results } from 'inversify-express-utils'
import { ControllerContainerInterface } from '@standardnotes/domain-core'
import { EncryptionVersion } from '../../Domain/Encryption/EncryptionVersion'
import { DeleteSetting } from '../../Domain/UseCase/DeleteSetting/DeleteSetting'
import { GetSetting } from '../../Domain/UseCase/GetSetting/GetSetting'
import { GetSettings } from '../../Domain/UseCase/GetSettings/GetSettings'
import { UpdateSetting } from '../../Domain/UseCase/UpdateSetting/UpdateSetting'
import { User } from '../../Domain/User/User'

describe('InversifyExpressSettingsController', () => {
  let deleteSetting: DeleteSetting
  let getSettings: GetSettings
  let getSetting: GetSetting
  let updateSetting: UpdateSetting

  let request: express.Request
  let response: express.Response
  let user: User
  let controllerContainer: ControllerContainerInterface

  const createController = () =>
    new InversifyExpressSettingsController(getSettings, getSetting, updateSetting, deleteSetting, controllerContainer)

  beforeEach(() => {
    controllerContainer = {} as jest.Mocked<ControllerContainerInterface>
    controllerContainer.register = jest.fn()

    deleteSetting = {} as jest.Mocked<DeleteSetting>
    deleteSetting.execute = jest.fn().mockReturnValue({ success: true })

    user = {} as jest.Mocked<User>
    user.uuid = '123'

    getSettings = {} as jest.Mocked<GetSettings>
    getSettings.execute = jest.fn()

    getSetting = {} as jest.Mocked<GetSetting>
    getSetting.execute = jest.fn()

    updateSetting = {} as jest.Mocked<UpdateSetting>
    updateSetting.execute = jest.fn()

    request = {
      headers: {},
      body: {},
      params: {},
    } as jest.Mocked<express.Request>

    response = {
      locals: {},
    } as jest.Mocked<express.Response>
  })

  it('should get user settings', async () => {
    request.params.userUuid = '1-2-3'
    response.locals.user = {
      uuid: '1-2-3',
    }

    const httpResponse = <results.JsonResult>await createController().getSettings(request, response)
    const result = await httpResponse.executeAsync()

    expect(getSettings.execute).toHaveBeenCalledWith({ userUuid: '1-2-3' })

    expect(result.statusCode).toEqual(200)
  })

  it('should not get user settings if not allowed', async () => {
    request.params.userUuid = '1-2-3'
    response.locals.user = {
      uuid: '2-3-4',
    }

    const httpResponse = <results.JsonResult>await createController().getSettings(request, response)
    const result = await httpResponse.executeAsync()

    expect(getSettings.execute).not.toHaveBeenCalled()

    expect(result.statusCode).toEqual(401)
  })

  it('should get user setting', async () => {
    request.params.userUuid = '1-2-3'
    request.params.settingName = 'test'
    response.locals.user = {
      uuid: '1-2-3',
    }

    getSetting.execute = jest.fn().mockReturnValue({ success: true })

    const httpResponse = <results.JsonResult>await createController().getSetting(request, response)
    const result = await httpResponse.executeAsync()

    expect(getSetting.execute).toHaveBeenCalledWith({ userUuid: '1-2-3', settingName: 'TEST' })

    expect(result.statusCode).toEqual(200)
  })

  it('should not get user setting if not allowed', async () => {
    request.params.userUuid = '1-2-3'
    request.params.settingName = 'test'
    response.locals.user = {
      uuid: '2-3-4',
    }

    getSetting.execute = jest.fn()

    const httpResponse = <results.JsonResult>await createController().getSetting(request, response)
    const result = await httpResponse.executeAsync()

    expect(getSetting.execute).not.toHaveBeenCalled()

    expect(result.statusCode).toEqual(401)
  })

  it('should fail if could not get user setting', async () => {
    request.params.userUuid = '1-2-3'
    request.params.settingName = 'test'
    response.locals.user = {
      uuid: '1-2-3',
    }

    getSetting.execute = jest.fn().mockReturnValue({ success: false })

    const httpResponse = <results.JsonResult>await createController().getSetting(request, response)
    const result = await httpResponse.executeAsync()

    expect(getSetting.execute).toHaveBeenCalledWith({ userUuid: '1-2-3', settingName: 'TEST' })

    expect(result.statusCode).toEqual(400)
  })

  it('should update user setting with default encryption', async () => {
    request.params.userUuid = '1-2-3'
    response.locals.user = {
      uuid: '1-2-3',
    }

    request.body = {
      name: 'foo',
      value: 'bar',
    }

    updateSetting.execute = jest.fn().mockReturnValue({ success: true, statusCode: 200 })

    const httpResponse = <results.JsonResult>await createController().updateSetting(request, response)
    const result = await httpResponse.executeAsync()

    expect(updateSetting.execute).toHaveBeenCalledWith({
      props: {
        name: 'foo',
        sensitive: false,
        serverEncryptionVersion: 1,
        unencryptedValue: 'bar',
      },
      userUuid: '1-2-3',
    })

    expect(result.statusCode).toEqual(200)
  })

  it('should update user setting with different encryption setting', async () => {
    request.params.userUuid = '1-2-3'
    response.locals.user = {
      uuid: '1-2-3',
    }

    request.body = {
      name: 'foo',
      value: 'bar',
      serverEncryptionVersion: EncryptionVersion.Unencrypted,
    }

    updateSetting.execute = jest.fn().mockReturnValue({ success: true, statusCode: 200 })

    const httpResponse = <results.JsonResult>await createController().updateSetting(request, response)
    const result = await httpResponse.executeAsync()

    expect(updateSetting.execute).toHaveBeenCalledWith({
      props: {
        name: 'foo',
        sensitive: false,
        serverEncryptionVersion: 0,
        unencryptedValue: 'bar',
      },
      userUuid: '1-2-3',
    })

    expect(result.statusCode).toEqual(200)
  })

  it('should not update user setting if session has read only access', async () => {
    request.params.userUuid = '1-2-3'
    response.locals.user = {
      uuid: '1-2-3',
    }
    response.locals.readOnlyAccess = true

    request.body = {
      name: 'foo',
      value: 'bar',
    }

    const httpResponse = <results.JsonResult>await createController().updateSetting(request, response)
    const result = await httpResponse.executeAsync()

    expect(updateSetting.execute).not.toHaveBeenCalled()

    expect(result.statusCode).toEqual(401)
  })

  it('should not update user setting if not allowed', async () => {
    request.params.userUuid = '1-2-3'
    response.locals.user = {
      uuid: '2-3-4',
    }

    request.body = {
      name: 'foo',
      value: 'bar',
      serverEncryptionVersion: EncryptionVersion.Default,
    }

    updateSetting.execute = jest.fn()

    const httpResponse = <results.JsonResult>await createController().updateSetting(request, response)
    const result = await httpResponse.executeAsync()

    expect(updateSetting.execute).not.toHaveBeenCalled()

    expect(result.statusCode).toEqual(401)
  })

  it('should fail if could not update user setting', async () => {
    request.params.userUuid = '1-2-3'
    response.locals.user = {
      uuid: '1-2-3',
    }

    request.body = {
      name: 'foo',
      value: 'bar',
      serverEncryptionVersion: EncryptionVersion.Default,
    }

    updateSetting.execute = jest.fn().mockReturnValue({ success: false, statusCode: 404 })

    const httpResponse = <results.JsonResult>await createController().updateSetting(request, response)
    const result = await httpResponse.executeAsync()

    expect(updateSetting.execute).toHaveBeenCalledWith({
      props: {
        name: 'foo',
        serverEncryptionVersion: 1,
        sensitive: false,
        unencryptedValue: 'bar',
      },
      userUuid: '1-2-3',
    })

    expect(result.statusCode).toEqual(404)
  })

  it('should delete user setting', async () => {
    request.params.userUuid = '1-2-3'
    request.params.settingName = 'foo'
    response.locals.user = {
      uuid: '1-2-3',
    }

    deleteSetting.execute = jest.fn().mockReturnValue({ success: true })

    const httpResponse = <results.JsonResult>await createController().deleteSetting(request, response)
    const result = await httpResponse.executeAsync()

    expect(deleteSetting.execute).toHaveBeenCalledWith({ userUuid: '1-2-3', settingName: 'foo' })

    expect(result.statusCode).toEqual(200)
  })

  it('should not delete user setting if session has read only access', async () => {
    request.params.userUuid = '1-2-3'
    request.params.settingName = 'foo'
    response.locals.user = {
      uuid: '1-2-3',
    }
    response.locals.readOnlyAccess = true

    const httpResponse = <results.JsonResult>await createController().deleteSetting(request, response)
    const result = await httpResponse.executeAsync()

    expect(deleteSetting.execute).not.toHaveBeenCalled()

    expect(result.statusCode).toEqual(401)
  })

  it('should not delete user setting if user is not allowed', async () => {
    request.params.userUuid = '1-2-3'
    request.params.settingName = 'foo'
    response.locals.user = {
      uuid: '2-3-4',
    }

    deleteSetting.execute = jest.fn()

    const httpResponse = <results.JsonResult>await createController().deleteSetting(request, response)
    const result = await httpResponse.executeAsync()

    expect(deleteSetting.execute).not.toHaveBeenCalled()

    expect(result.statusCode).toEqual(401)
  })

  it('should fail if could not delete user setting', async () => {
    request.params.userUuid = '1-2-3'
    request.params.settingName = 'foo'
    response.locals.user = {
      uuid: '1-2-3',
    }

    deleteSetting.execute = jest.fn().mockReturnValue({ success: false })

    const httpResponse = <results.JsonResult>await createController().deleteSetting(request, response)
    const result = await httpResponse.executeAsync()

    expect(deleteSetting.execute).toHaveBeenCalledWith({ userUuid: '1-2-3', settingName: 'foo' })

    expect(result.statusCode).toEqual(400)
  })
})

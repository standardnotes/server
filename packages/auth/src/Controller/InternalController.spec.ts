import 'reflect-metadata'

import * as express from 'express'

import { InternalController } from './InternalController'
import { results } from 'inversify-express-utils'
import { User } from '../Domain/User/User'
import { GetUserFeatures } from '../Domain/UseCase/GetUserFeatures/GetUserFeatures'
import { GetSetting } from '../Domain/UseCase/GetSetting/GetSetting'
import { MuteFailedBackupsEmails } from '../Domain/UseCase/MuteFailedBackupsEmails/MuteFailedBackupsEmails'
import { MuteSignInEmails } from '../Domain/UseCase/MuteSignInEmails/MuteSignInEmails'
import { MuteMarketingEmails } from '../Domain/UseCase/MuteMarketingEmails/MuteMarketingEmails'

describe('InternalController', () => {
  let getUserFeatures: GetUserFeatures
  let getSetting: GetSetting
  let muteFailedBackupsEmails: MuteFailedBackupsEmails
  let muteSignInEmails: MuteSignInEmails
  let muteMarketingEmails: MuteMarketingEmails

  let request: express.Request
  let response: express.Response
  let user: User

  const createController = () =>
    new InternalController(getUserFeatures, getSetting, muteFailedBackupsEmails, muteSignInEmails, muteMarketingEmails)

  beforeEach(() => {
    user = {} as jest.Mocked<User>
    user.uuid = '123'

    getUserFeatures = {} as jest.Mocked<GetUserFeatures>
    getUserFeatures.execute = jest.fn()

    getSetting = {} as jest.Mocked<GetSetting>
    getSetting.execute = jest.fn()

    muteFailedBackupsEmails = {} as jest.Mocked<MuteFailedBackupsEmails>
    muteFailedBackupsEmails.execute = jest.fn()

    muteSignInEmails = {} as jest.Mocked<MuteSignInEmails>
    muteSignInEmails.execute = jest.fn()

    muteMarketingEmails = {} as jest.Mocked<MuteMarketingEmails>
    muteMarketingEmails.execute = jest.fn()

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

  it('should mute failed backup emails user setting', async () => {
    request.params.settingUuid = '1-2-3'

    muteFailedBackupsEmails.execute = jest.fn().mockReturnValue({ success: true })

    const httpResponse = <results.JsonResult>await createController().muteFailedBackupsEmails(request)
    const result = await httpResponse.executeAsync()

    expect(muteFailedBackupsEmails.execute).toHaveBeenCalledWith({ settingUuid: '1-2-3' })

    expect(result.statusCode).toEqual(200)
  })

  it('should not mute failed backup emails user setting if it does not exist', async () => {
    request.params.settingUuid = '1-2-3'

    muteFailedBackupsEmails.execute = jest.fn().mockReturnValue({ success: false })

    const httpResponse = <results.JsonResult>await createController().muteFailedBackupsEmails(request)
    const result = await httpResponse.executeAsync()

    expect(muteFailedBackupsEmails.execute).toHaveBeenCalledWith({ settingUuid: '1-2-3' })

    expect(result.statusCode).toEqual(404)
  })

  it('should mute sign in emails user setting', async () => {
    request.params.settingUuid = '1-2-3'

    muteSignInEmails.execute = jest.fn().mockReturnValue({ success: true })

    const httpResponse = <results.JsonResult>await createController().muteSignInEmails(request)
    const result = await httpResponse.executeAsync()

    expect(muteSignInEmails.execute).toHaveBeenCalledWith({ settingUuid: '1-2-3' })

    expect(result.statusCode).toEqual(200)
  })

  it('should not mute sign in emails user setting if it does not exist', async () => {
    request.params.settingUuid = '1-2-3'

    muteSignInEmails.execute = jest.fn().mockReturnValue({ success: false })

    const httpResponse = <results.JsonResult>await createController().muteSignInEmails(request)
    const result = await httpResponse.executeAsync()

    expect(muteSignInEmails.execute).toHaveBeenCalledWith({ settingUuid: '1-2-3' })

    expect(result.statusCode).toEqual(404)
  })

  it('should mute marketing emails user setting', async () => {
    request.params.settingUuid = '1-2-3'

    muteMarketingEmails.execute = jest.fn().mockReturnValue({ success: true, message: 'foobar' })

    await createController().muteMarketingEmails(request, response)

    expect(muteMarketingEmails.execute).toHaveBeenCalledWith({ settingUuid: '1-2-3' })

    expect(response.setHeader).toHaveBeenCalledWith('content-type', 'text/html')
    expect(response.send).toHaveBeenCalledWith('foobar')
  })

  it('should not mute marketing emails user setting if it does not exist', async () => {
    request.params.settingUuid = '1-2-3'

    muteMarketingEmails.execute = jest.fn().mockReturnValue({ success: false, message: 'foobar' })

    await createController().muteMarketingEmails(request, response)

    expect(muteMarketingEmails.execute).toHaveBeenCalledWith({ settingUuid: '1-2-3' })

    expect(response.setHeader).toHaveBeenCalledWith('content-type', 'text/html')
    expect(response.status).toHaveBeenCalledWith(404)
    expect(response.send).toHaveBeenCalledWith('foobar')
  })
})

import 'reflect-metadata'

import { AdminController } from './AdminController'
import { results } from 'inversify-express-utils'
import { User } from '../Domain/User/User'
import { UserRepositoryInterface } from '../Domain/User/UserRepositoryInterface'
import * as express from 'express'
import { DeleteSetting } from '../Domain/UseCase/DeleteSetting/DeleteSetting'
import { CreateSubscriptionToken } from '../Domain/UseCase/CreateSubscriptionToken/CreateSubscriptionToken'
import { CreateOfflineSubscriptionToken } from '../Domain/UseCase/CreateOfflineSubscriptionToken/CreateOfflineSubscriptionToken'
import { ControllerContainerInterface } from '@standardnotes/domain-core'

describe('AdminController', () => {
  let deleteSetting: DeleteSetting
  let userRepository: UserRepositoryInterface
  let createSubscriptionToken: CreateSubscriptionToken
  let createOfflineSubscriptionToken: CreateOfflineSubscriptionToken
  let request: express.Request
  let user: User
  let controllerContainer: ControllerContainerInterface

  const createController = () =>
    new AdminController(
      deleteSetting,
      userRepository,
      createSubscriptionToken,
      createOfflineSubscriptionToken,
      controllerContainer,
    )

  beforeEach(() => {
    user = {} as jest.Mocked<User>
    user.uuid = '123'

    deleteSetting = {} as jest.Mocked<DeleteSetting>
    deleteSetting.execute = jest.fn().mockReturnValue({ success: true })

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(user)

    createSubscriptionToken = {} as jest.Mocked<CreateSubscriptionToken>
    createSubscriptionToken.execute = jest.fn().mockReturnValue({
      subscriptionToken: {
        token: '123-sub-token',
      },
    })

    createOfflineSubscriptionToken = {} as jest.Mocked<CreateOfflineSubscriptionToken>
    createOfflineSubscriptionToken.execute = jest.fn().mockReturnValue({
      success: true,
      offlineSubscriptionToken: {
        token: '123-sub-token',
      },
    })

    request = {
      headers: {},
      body: {},
      params: {},
    } as jest.Mocked<express.Request>

    controllerContainer = {} as jest.Mocked<ControllerContainerInterface>
    controllerContainer.register = jest.fn()
  })

  it('should return error if missing email parameter', async () => {
    const httpResponse = await createController().getUser(request)
    const result = await httpResponse.executeAsync()

    expect(httpResponse).toBeInstanceOf(results.JsonResult)

    expect(result.statusCode).toBe(400)
    expect(await result.content.readAsStringAsync()).toEqual('{"error":{"message":"Missing email parameter."}}')
  })

  it('should return error if no user with such email exists', async () => {
    request.params.email = 'test@sn.org'

    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(null)

    const httpResponse = await createController().getUser(request)
    const result = await httpResponse.executeAsync()

    expect(httpResponse).toBeInstanceOf(results.JsonResult)

    expect(result.statusCode).toBe(400)
    expect(await result.content.readAsStringAsync()).toEqual(
      '{"error":{"message":"No user with email \'test@sn.org\'."}}',
    )
  })

  it("should return the user's uuid", async () => {
    request.params.email = 'test@sn.org'

    const httpResponse = await createController().getUser(request)
    const result = await httpResponse.executeAsync()

    expect(httpResponse).toBeInstanceOf(results.JsonResult)

    expect(result.statusCode).toBe(200)
    expect(await result.content.readAsStringAsync()).toEqual('{"uuid":"123"}')
  })

  it('should delete user mfa setting', async () => {
    request.params.userUuid = '1-2-3'

    deleteSetting.execute = jest.fn().mockReturnValue({ success: true })

    const httpResponse = <results.JsonResult>await createController().deleteMFASetting(request)
    const result = await httpResponse.executeAsync()

    expect(deleteSetting.execute).toHaveBeenCalledWith({
      userUuid: '1-2-3',
      settingName: 'MFA_SECRET',
      softDelete: true,
    })

    expect(result.statusCode).toEqual(200)
  })

  it('should fail if could not delete user mfa setting', async () => {
    request.params.userUuid = '1-2-3'

    deleteSetting.execute = jest.fn().mockReturnValue({ success: false })

    const httpResponse = <results.JsonResult>await createController().deleteMFASetting(request)
    const result = await httpResponse.executeAsync()

    expect(deleteSetting.execute).toHaveBeenCalledWith({
      userUuid: '1-2-3',
      settingName: 'MFA_SECRET',
      softDelete: true,
    })

    expect(result.statusCode).toEqual(400)
  })

  it("should return a new subscription token for the user's uuid", async () => {
    request.params.userUuid = '1-2-3'

    const httpResponse = await createController().createToken(request)
    const result = await httpResponse.executeAsync()

    expect(httpResponse).toBeInstanceOf(results.JsonResult)

    expect(result.statusCode).toBe(200)
    expect(await result.content.readAsStringAsync()).toEqual('{"token":"123-sub-token"}')
  })

  it("should return a new offline subscription token for the user's email", async () => {
    request.params.email = 'test@test.te'

    const httpResponse = await createController().createOfflineToken(request)
    const result = await httpResponse.executeAsync()

    expect(httpResponse).toBeInstanceOf(results.JsonResult)

    expect(result.statusCode).toBe(200)
    expect(await result.content.readAsStringAsync()).toEqual('{"token":"123-sub-token"}')
  })

  it('should not return a new offline subscription token if the workflow fails', async () => {
    request.params.email = 'test@test.te'

    createOfflineSubscriptionToken.execute = jest.fn().mockReturnValue({ success: false })

    const httpResponse = await createController().createOfflineToken(request)
    const result = await httpResponse.executeAsync()

    expect(httpResponse).toBeInstanceOf(results.BadRequestResult)

    expect(result.statusCode).toBe(400)
  })

  it('should not delete email backup setting if value is null', async () => {
    request.body = {}
    request.params = {
      userUuid: '1-2-3',
    }

    deleteSetting.execute = jest.fn().mockReturnValue({ success: false })

    const httpResponse = <results.OkResult>await createController().disableEmailBackups(request)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(400)
    expect(await result.content.readAsStringAsync()).toEqual('No email backups found')
  })

  it('should disable email backups by deleting the setting', async () => {
    request.body = {}
    request.params = {
      userUuid: '1-2-3',
    }

    deleteSetting.execute = jest.fn().mockReturnValue({ success: true })

    const httpResponse = <results.OkResult>await createController().disableEmailBackups(request)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(200)
  })
})

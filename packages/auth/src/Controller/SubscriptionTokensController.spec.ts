import 'reflect-metadata'

import * as express from 'express'
import { results } from 'inversify-express-utils'

import { SubscriptionTokensController } from './SubscriptionTokensController'
import { User } from '../Domain/User/User'
import { CreateSubscriptionToken } from '../Domain/UseCase/CreateSubscriptionToken/CreateSubscriptionToken'
import { CreateSubscriptionTokenResponse } from '../Domain/UseCase/CreateSubscriptionToken/CreateSubscriptionTokenResponse'
import { AuthenticateSubscriptionToken } from '../Domain/UseCase/AuthenticateSubscriptionToken/AuthenticateSubscriptionToken'
import { ProjectorInterface } from '../Projection/ProjectorInterface'
import { Role } from '../Domain/Role/Role'
import { SettingServiceInterface } from '../Domain/Setting/SettingServiceInterface'
import { Setting } from '../Domain/Setting/Setting'
import { CrossServiceTokenData, TokenEncoderInterface } from '@standardnotes/auth'
import { GetUserAnalyticsId } from '../Domain/UseCase/GetUserAnalyticsId/GetUserAnalyticsId'

describe('SubscriptionTokensController', () => {
  let createSubscriptionToken: CreateSubscriptionToken
  let authenticateToken: AuthenticateSubscriptionToken
  const jwtTTL = 60
  let userProjector: ProjectorInterface<User>
  let roleProjector: ProjectorInterface<Role>
  let settingService: SettingServiceInterface
  let extensionKeySetting: Setting
  let tokenEncoder: TokenEncoderInterface<CrossServiceTokenData>
  let getUserAnalyticsId: GetUserAnalyticsId

  let request: express.Request
  let response: express.Response
  let user: User
  let role: Role

  const createController = () =>
    new SubscriptionTokensController(
      createSubscriptionToken,
      authenticateToken,
      settingService,
      userProjector,
      roleProjector,
      tokenEncoder,
      getUserAnalyticsId,
      jwtTTL,
    )

  beforeEach(() => {
    user = {} as jest.Mocked<User>
    user.uuid = '123'
    user.roles = Promise.resolve([role])

    createSubscriptionToken = {} as jest.Mocked<CreateSubscriptionToken>
    createSubscriptionToken.execute = jest.fn().mockReturnValue({
      subscriptionToken: {
        token: 'test',
      },
    } as jest.Mocked<CreateSubscriptionTokenResponse>)

    authenticateToken = {} as jest.Mocked<AuthenticateSubscriptionToken>
    authenticateToken.execute = jest.fn().mockReturnValue({
      success: true,
      user,
    })

    userProjector = {} as jest.Mocked<ProjectorInterface<User>>
    userProjector.projectSimple = jest.fn().mockReturnValue({ bar: 'baz' })

    roleProjector = {} as jest.Mocked<ProjectorInterface<Role>>
    roleProjector.projectSimple = jest.fn().mockReturnValue({ name: 'role1', uuid: '1-3-4' })

    extensionKeySetting = {
      name: 'EXTENSION_KEY',
      value: 'abc123',
    } as jest.Mocked<Setting>

    settingService = {} as jest.Mocked<SettingServiceInterface>
    settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue(extensionKeySetting)

    tokenEncoder = {} as jest.Mocked<TokenEncoderInterface<CrossServiceTokenData>>
    tokenEncoder.encodeExpirableToken = jest.fn().mockReturnValue('foobar')

    getUserAnalyticsId = {} as jest.Mocked<GetUserAnalyticsId>
    getUserAnalyticsId.execute = jest.fn().mockReturnValue({ analyticsId: 123 })

    request = {
      headers: {},
      body: {},
      params: {},
    } as jest.Mocked<express.Request>

    response = {
      locals: {},
    } as jest.Mocked<express.Response>
  })

  it('should create an subscription token for authenticated user', async () => {
    response.locals.user = {
      uuid: '1-2-3',
    }

    const httpResponse = <results.JsonResult>await createController().createToken(request, response)
    const result = await httpResponse.executeAsync()

    expect(createSubscriptionToken.execute).toHaveBeenCalledWith({
      userUuid: '1-2-3',
    })

    expect(result.statusCode).toEqual(200)
  })

  it('should not create an subscription token if session has read only access', async () => {
    response.locals.user = {
      uuid: '1-2-3',
    }
    response.locals.readOnlyAccess = true

    const httpResponse = <results.JsonResult>await createController().createToken(request, response)
    const result = await httpResponse.executeAsync()

    expect(createSubscriptionToken.execute).not.toHaveBeenCalled()

    expect(result.statusCode).toEqual(401)
  })

  it('should validate an subscription token for user', async () => {
    request.params.token = 'test'

    const httpResponse = <results.JsonResult>await createController().validate(request)
    const result = await httpResponse.executeAsync()

    expect(authenticateToken.execute).toHaveBeenCalledWith({
      token: 'test',
    })

    const responseBody = JSON.parse(await result.content.readAsStringAsync())
    expect(responseBody.authToken).toEqual('foobar')
    expect(result.statusCode).toEqual(200)

    expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalledWith(
      {
        analyticsId: 123,
        extensionKey: 'abc123',
        roles: [
          {
            name: 'role1',
            uuid: '1-3-4',
          },
        ],
        user: {
          bar: 'baz',
        },
      },
      60,
    )
  })

  it('should validate an subscription token for user without an extension key setting', async () => {
    request.params.token = 'test'

    settingService.findSettingWithDecryptedValue = jest.fn().mockReturnValue(null)

    const httpResponse = <results.JsonResult>await createController().validate(request)
    const result = await httpResponse.executeAsync()

    expect(authenticateToken.execute).toHaveBeenCalledWith({
      token: 'test',
    })

    const responseBody = JSON.parse(await result.content.readAsStringAsync())

    expect(responseBody.authToken).toEqual('foobar')
    expect(result.statusCode).toEqual(200)
  })

  it('should not validate an subscription token for user if it is invalid', async () => {
    request.params.token = 'test'

    authenticateToken.execute = jest.fn().mockReturnValue({
      success: false,
    })

    const httpResponse = <results.JsonResult>await createController().validate(request)
    const result = await httpResponse.executeAsync()

    expect(authenticateToken.execute).toHaveBeenCalledWith({
      token: 'test',
    })

    expect(result.statusCode).toEqual(401)
  })
})

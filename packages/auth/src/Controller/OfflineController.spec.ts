import 'reflect-metadata'

import * as express from 'express'

import { OfflineController } from './OfflineController'
import { results } from 'inversify-express-utils'
import { User } from '../Domain/User/User'
import { GetUserFeatures } from '../Domain/UseCase/GetUserFeatures/GetUserFeatures'
import { CreateOfflineSubscriptionToken } from '../Domain/UseCase/CreateOfflineSubscriptionToken/CreateOfflineSubscriptionToken'
import { CreateOfflineSubscriptionTokenResponse } from '../Domain/UseCase/CreateOfflineSubscriptionToken/CreateOfflineSubscriptionTokenResponse'
import { AuthenticateOfflineSubscriptionToken } from '../Domain/UseCase/AuthenticateOfflineSubscriptionToken/AuthenticateOfflineSubscriptionToken'
import { OfflineUserSubscription } from '../Domain/Subscription/OfflineUserSubscription'
import { GetUserOfflineSubscription } from '../Domain/UseCase/GetUserOfflineSubscription/GetUserOfflineSubscription'
import { OfflineUserTokenData, TokenEncoderInterface } from '@standardnotes/auth'
import { SubscriptionName } from '@standardnotes/common'
import { Logger } from 'winston'

describe('OfflineController', () => {
  let getUserFeatures: GetUserFeatures
  let getUserOfflineSubscription: GetUserOfflineSubscription
  let createOfflineSubscriptionToken: CreateOfflineSubscriptionToken
  let authenticateToken: AuthenticateOfflineSubscriptionToken
  let logger: Logger
  let tokenEncoder: TokenEncoderInterface<OfflineUserTokenData>
  const jwtTTL = 60

  let request: express.Request
  let response: express.Response
  let user: User

  const createController = () =>
    new OfflineController(
      getUserFeatures,
      getUserOfflineSubscription,
      createOfflineSubscriptionToken,
      authenticateToken,
      tokenEncoder,
      jwtTTL,
      logger,
    )

  beforeEach(() => {
    user = {} as jest.Mocked<User>
    user.uuid = '123'

    getUserFeatures = {} as jest.Mocked<GetUserFeatures>
    getUserFeatures.execute = jest.fn()

    createOfflineSubscriptionToken = {} as jest.Mocked<CreateOfflineSubscriptionToken>
    createOfflineSubscriptionToken.execute = jest.fn().mockReturnValue({
      success: true,
      offlineSubscriptionToken: {
        token: 'test',
      },
    } as jest.Mocked<CreateOfflineSubscriptionTokenResponse>)

    getUserOfflineSubscription = {} as jest.Mocked<GetUserOfflineSubscription>
    getUserOfflineSubscription.execute = jest.fn().mockReturnValue({
      success: true,
      subscription: {
        planName: SubscriptionName.ProPlan,
      },
    })

    authenticateToken = {} as jest.Mocked<AuthenticateOfflineSubscriptionToken>
    authenticateToken.execute = jest.fn().mockReturnValue({
      success: true,
      email: 'test@test.com',
      subscriptions: [{} as jest.Mocked<OfflineUserSubscription>],
    })

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()

    tokenEncoder = {} as jest.Mocked<TokenEncoderInterface<OfflineUserTokenData>>
    tokenEncoder.encodeExpirableToken = jest.fn().mockReturnValue('foobar')

    request = {
      headers: {},
      body: {},
      params: {},
    } as jest.Mocked<express.Request>

    response = {
      locals: {},
    } as jest.Mocked<express.Response>
  })

  it('should get offline user features', async () => {
    response.locals.offlineUserEmail = 'test@test.com'

    getUserFeatures.execute = jest.fn().mockReturnValue({ success: true })

    const httpResponse = <results.JsonResult>await createController().getOfflineFeatures(request, response)
    const result = await httpResponse.executeAsync()

    expect(getUserFeatures.execute).toHaveBeenCalledWith({
      email: 'test@test.com',
      offline: true,
    })

    expect(result.statusCode).toEqual(200)
  })

  it('should get offline user subscription', async () => {
    response.locals.userEmail = 'test@test.com'

    const httpResponse = <results.JsonResult>await createController().getSubscription(request, response)
    const result = await httpResponse.executeAsync()

    expect(getUserOfflineSubscription.execute).toHaveBeenCalledWith({
      userEmail: 'test@test.com',
    })

    expect(result.statusCode).toEqual(200)
  })

  it('should not get offline user subscription if the procedure fails', async () => {
    response.locals.userEmail = 'test@test.com'

    getUserOfflineSubscription.execute = jest.fn().mockReturnValue({ success: false })

    const httpResponse = <results.JsonResult>await createController().getSubscription(request, response)
    const result = await httpResponse.executeAsync()

    expect(getUserOfflineSubscription.execute).toHaveBeenCalledWith({
      userEmail: 'test@test.com',
    })

    expect(result.statusCode).toEqual(400)
  })

  it('should not get offline user features if the procedure fails', async () => {
    response.locals.offlineUserEmail = 'test@test.com'

    getUserFeatures.execute = jest.fn().mockReturnValue({ success: false })

    const httpResponse = <results.JsonResult>await createController().getOfflineFeatures(request, response)
    const result = await httpResponse.executeAsync()

    expect(getUserFeatures.execute).toHaveBeenCalledWith({
      email: 'test@test.com',
      offline: true,
    })

    expect(result.statusCode).toEqual(400)
  })

  it('should create a offline subscription token for authenticated user', async () => {
    request.body.email = 'test@test.com'

    const httpResponse = <results.JsonResult>await createController().createToken(request)
    const result = await httpResponse.executeAsync()

    expect(createOfflineSubscriptionToken.execute).toHaveBeenCalledWith({
      userEmail: 'test@test.com',
    })

    expect(result.statusCode).toEqual(200)
  })

  it('should not create a offline subscription token for missing email in request', async () => {
    const httpResponse = <results.JsonResult>await createController().createToken(request)
    const result = await httpResponse.executeAsync()

    expect(createOfflineSubscriptionToken.execute).not.toHaveBeenCalled()

    expect(result.statusCode).toEqual(400)
  })

  it('should not create a offline subscription token if the workflow fails with no subscription', async () => {
    request.body.email = 'test@test.com'

    createOfflineSubscriptionToken.execute = jest.fn().mockReturnValue({
      success: false,
      error: 'no-subscription',
    })

    const httpResponse = <results.JsonResult>await createController().createToken(request)
    const result = await httpResponse.executeAsync()

    expect(createOfflineSubscriptionToken.execute).toHaveBeenCalledWith({
      userEmail: 'test@test.com',
    })

    expect(httpResponse.json).toEqual({ success: false, error: { tag: 'no-subscription' } })
    expect(result.statusCode).toEqual(200)
  })

  it('should validate a offline subscription token for user', async () => {
    request.params.token = 'test'
    request.body.email = 'test@test.com'

    const httpResponse = <results.JsonResult>await createController().validate(request)
    const result = await httpResponse.executeAsync()

    expect(authenticateToken.execute).toHaveBeenCalledWith({
      token: 'test',
      userEmail: 'test@test.com',
    })

    expect(result.statusCode).toEqual(200)
  })

  it('should not validate a offline subscription token for user if it is invalid', async () => {
    request.body.email = 'test@test.com'
    request.params.token = 'test'

    authenticateToken.execute = jest.fn().mockReturnValue({
      success: false,
    })

    const httpResponse = <results.JsonResult>await createController().validate(request)
    const result = await httpResponse.executeAsync()

    expect(authenticateToken.execute).toHaveBeenCalledWith({
      token: 'test',
      userEmail: 'test@test.com',
    })

    expect(result.statusCode).toEqual(401)
  })

  it('should not validate a offline subscription token for user if email is missing', async () => {
    request.params.token = 'test'

    const httpResponse = <results.JsonResult>await createController().validate(request)
    const result = await httpResponse.executeAsync()

    expect(authenticateToken.execute).not.toHaveBeenCalled()

    expect(result.statusCode).toEqual(400)
  })
})

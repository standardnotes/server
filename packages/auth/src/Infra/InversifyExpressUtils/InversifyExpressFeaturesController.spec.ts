import 'reflect-metadata'

import * as express from 'express'

import { InversifyExpressFeaturesController } from './InversifyExpressFeaturesController'
import { results } from 'inversify-express-utils'
import { User } from '../../Domain/User/User'
import { GetUserFeatures } from '../../Domain/UseCase/GetUserFeatures/GetUserFeatures'

describe('InversifyExpressFeaturesController', () => {
  let getUserFeatures: GetUserFeatures

  let request: express.Request
  let response: express.Response
  let user: User

  const createController = () => new InversifyExpressFeaturesController(getUserFeatures)

  beforeEach(() => {
    user = {} as jest.Mocked<User>
    user.uuid = '123'

    getUserFeatures = {} as jest.Mocked<GetUserFeatures>
    getUserFeatures.execute = jest.fn()

    request = {
      headers: {},
      body: {},
      params: {},
    } as jest.Mocked<express.Request>

    response = {
      locals: {},
    } as jest.Mocked<express.Response>
  })

  it('should get authenticated user features', async () => {
    request.params.userUuid = '1-2-3'
    response.locals.user = {
      uuid: '1-2-3',
    }

    getUserFeatures.execute = jest.fn().mockReturnValue({ success: true })

    const httpResponse = <results.JsonResult>await createController().getFeatures(request, response)
    const result = await httpResponse.executeAsync()

    expect(getUserFeatures.execute).toHaveBeenCalledWith({
      userUuid: '1-2-3',
      offline: false,
    })

    expect(result.statusCode).toEqual(200)
  })

  it('should not get user features if the user with provided uuid does not exist', async () => {
    request.params.userUuid = '1-2-3'
    response.locals.user = {
      uuid: '1-2-3',
    }

    getUserFeatures.execute = jest.fn().mockReturnValue({ success: false })

    const httpResponse = <results.JsonResult>await createController().getFeatures(request, response)
    const result = await httpResponse.executeAsync()

    expect(getUserFeatures.execute).toHaveBeenCalledWith({ userUuid: '1-2-3', offline: false })

    expect(result.statusCode).toEqual(400)
  })

  it('should not get user features if not allowed', async () => {
    request.params.userUuid = '1-2-3'
    response.locals.user = {
      uuid: '2-3-4',
    }

    getUserFeatures.execute = jest.fn()

    const httpResponse = <results.JsonResult>await createController().getFeatures(request, response)
    const result = await httpResponse.executeAsync()

    expect(getUserFeatures.execute).not.toHaveBeenCalled()

    expect(result.statusCode).toEqual(401)
  })
})

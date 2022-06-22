import 'reflect-metadata'

import * as express from 'express'

import { SessionsController } from './SessionsController'
import { results } from 'inversify-express-utils'
import { Session } from '../Domain/Session/Session'
import { ProjectorInterface } from '../Projection/ProjectorInterface'
import { GetActiveSessionsForUser } from '../Domain/UseCase/GetActiveSessionsForUser'
import { AuthenticateRequest } from '../Domain/UseCase/AuthenticateRequest'
import { User } from '../Domain/User/User'
import { Role } from '../Domain/Role/Role'
import { CrossServiceTokenData, TokenEncoderInterface } from '@standardnotes/auth'
import { GetUserAnalyticsId } from '../Domain/UseCase/GetUserAnalyticsId/GetUserAnalyticsId'

describe('SessionsController', () => {
  let getActiveSessionsForUser: GetActiveSessionsForUser
  let authenticateRequest: AuthenticateRequest
  let userProjector: ProjectorInterface<User>
  let tokenEncoder: TokenEncoderInterface<CrossServiceTokenData>
  const jwtTTL = 60
  let sessionProjector: ProjectorInterface<Session>
  let roleProjector: ProjectorInterface<Role>
  let session: Session
  let request: express.Request
  let response: express.Response
  let user: User
  let role: Role
  let getUserAnalyticsId: GetUserAnalyticsId

  const createController = () =>
    new SessionsController(
      getActiveSessionsForUser,
      authenticateRequest,
      userProjector,
      sessionProjector,
      roleProjector,
      tokenEncoder,
      getUserAnalyticsId,
      true,
      jwtTTL,
    )

  beforeEach(() => {
    session = {} as jest.Mocked<Session>

    user = {} as jest.Mocked<User>
    user.roles = Promise.resolve([role])

    getActiveSessionsForUser = {} as jest.Mocked<GetActiveSessionsForUser>
    getActiveSessionsForUser.execute = jest.fn().mockReturnValue({ sessions: [session] })

    authenticateRequest = {} as jest.Mocked<AuthenticateRequest>
    authenticateRequest.execute = jest.fn()

    userProjector = {} as jest.Mocked<ProjectorInterface<User>>
    userProjector.projectSimple = jest.fn().mockReturnValue({ bar: 'baz' })

    roleProjector = {} as jest.Mocked<ProjectorInterface<Role>>
    roleProjector.projectSimple = jest.fn().mockReturnValue({ name: 'role1', uuid: '1-3-4' })

    sessionProjector = {} as jest.Mocked<ProjectorInterface<Session>>
    sessionProjector.projectCustom = jest.fn().mockReturnValue({ foo: 'bar' })
    sessionProjector.projectSimple = jest.fn().mockReturnValue({ test: 'test' })

    tokenEncoder = {} as jest.Mocked<TokenEncoderInterface<CrossServiceTokenData>>
    tokenEncoder.encodeExpirableToken = jest.fn().mockReturnValue('foobar')

    getUserAnalyticsId = {} as jest.Mocked<GetUserAnalyticsId>
    getUserAnalyticsId.execute = jest.fn().mockReturnValue({ analyticsId: 123 })

    request = {
      params: {},
      headers: {},
    } as jest.Mocked<express.Request>

    response = {
      locals: {},
    } as jest.Mocked<express.Response>
  })

  it('should get all active sessions for current user', async () => {
    response.locals = {
      user: {
        uuid: '123',
      },
      session: {
        uuid: '234',
      },
    }

    const httpResponse = await createController().getSessions(request, response)

    expect(httpResponse).toBeInstanceOf(results.JsonResult)

    const result = await httpResponse.executeAsync()
    expect(await result.content.readAsStringAsync()).toEqual('[{"foo":"bar"}]')
  })

  it('should validate a session from an incoming request', async () => {
    authenticateRequest.execute = jest.fn().mockReturnValue({
      success: true,
      user,
      session,
    })

    request.headers.authorization = 'test'

    const httpResponse = await createController().validate(request)

    expect(httpResponse).toBeInstanceOf(results.JsonResult)

    const result = await httpResponse.executeAsync()
    const httpResponseContent = await result.content.readAsStringAsync()
    const httpResponseJSON = JSON.parse(httpResponseContent)

    expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalledWith(
      {
        analyticsId: 123,
        roles: [
          {
            name: 'role1',
            uuid: '1-3-4',
          },
        ],
        session: {
          test: 'test',
        },
        user: {
          bar: 'baz',
        },
      },
      60,
    )

    expect(httpResponseJSON.authToken).toEqual('foobar')
  })

  it('should validate a session from an incoming request - disabled analytics', async () => {
    authenticateRequest.execute = jest.fn().mockReturnValue({
      success: true,
      user,
      session,
    })

    request.headers.authorization = 'test'

    const controller = new SessionsController(
      getActiveSessionsForUser,
      authenticateRequest,
      userProjector,
      sessionProjector,
      roleProjector,
      tokenEncoder,
      getUserAnalyticsId,
      false,
      jwtTTL,
    )

    const httpResponse = await controller.validate(request)

    expect(httpResponse).toBeInstanceOf(results.JsonResult)

    const result = await httpResponse.executeAsync()
    const httpResponseContent = await result.content.readAsStringAsync()
    const httpResponseJSON = JSON.parse(httpResponseContent)

    expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalledWith(
      {
        roles: [
          {
            name: 'role1',
            uuid: '1-3-4',
          },
        ],
        session: {
          test: 'test',
        },
        user: {
          bar: 'baz',
        },
      },
      60,
    )

    expect(httpResponseJSON.authToken).toEqual('foobar')
  })

  it('should validate a user from an incoming request', async () => {
    authenticateRequest.execute = jest.fn().mockReturnValue({
      success: true,
      user,
    })

    request.headers.authorization = 'test'

    const httpResponse = await createController().validate(request)

    expect(httpResponse).toBeInstanceOf(results.JsonResult)

    const result = await httpResponse.executeAsync()
    const httpResponseContent = await result.content.readAsStringAsync()
    const httpResponseJSON = JSON.parse(httpResponseContent)

    expect(httpResponseJSON.authToken).toEqual('foobar')
  })

  it('should not validate a session from an incoming request', async () => {
    authenticateRequest.execute = jest.fn().mockReturnValue({
      success: false,
      errorTag: 'invalid-auth',
      errorMessage: 'Invalid login credentials.',
      responseCode: 401,
    })

    request.headers.authorization = 'test'

    const httpResponse = await createController().validate(request)

    expect(httpResponse).toBeInstanceOf(results.JsonResult)
    expect(httpResponse.statusCode).toEqual(401)

    const result = await httpResponse.executeAsync()
    expect(await result.content.readAsStringAsync()).toEqual(
      '{"error":{"tag":"invalid-auth","message":"Invalid login credentials."}}',
    )
  })
})

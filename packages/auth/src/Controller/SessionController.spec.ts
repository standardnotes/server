import 'reflect-metadata'

import * as express from 'express'

import { SessionController } from './SessionController'
import { results } from 'inversify-express-utils'
import { RefreshSessionToken } from '../Domain/UseCase/RefreshSessionToken'
import { DeletePreviousSessionsForUser } from '../Domain/UseCase/DeletePreviousSessionsForUser'
import { DeleteSessionForUser } from '../Domain/UseCase/DeleteSessionForUser'
import { ControllerContainerInterface } from '@standardnotes/domain-core'

describe('SessionController', () => {
  let deleteSessionForUser: DeleteSessionForUser
  let deletePreviousSessionsForUser: DeletePreviousSessionsForUser
  let refreshSessionToken: RefreshSessionToken
  let request: express.Request
  let response: express.Response
  let controllerContainer: ControllerContainerInterface

  const createController = () =>
    new SessionController(deleteSessionForUser, deletePreviousSessionsForUser, refreshSessionToken, controllerContainer)

  beforeEach(() => {
    controllerContainer = {} as jest.Mocked<ControllerContainerInterface>
    controllerContainer.register = jest.fn()

    deleteSessionForUser = {} as jest.Mocked<DeleteSessionForUser>
    deleteSessionForUser.execute = jest.fn().mockReturnValue({ success: true })

    deletePreviousSessionsForUser = {} as jest.Mocked<DeletePreviousSessionsForUser>
    deletePreviousSessionsForUser.execute = jest.fn()

    refreshSessionToken = {} as jest.Mocked<RefreshSessionToken>
    refreshSessionToken.execute = jest.fn()

    request = {
      body: {},
    } as jest.Mocked<express.Request>

    response = {
      locals: {},
    } as jest.Mocked<express.Response>
    response.status = jest.fn().mockReturnThis()
    response.setHeader = jest.fn()
    response.send = jest.fn()
  })

  it('should refresh session tokens', async () => {
    request.body.access_token = '123'
    request.body.refresh_token = '234'

    refreshSessionToken.execute = jest.fn().mockReturnValue({
      success: true,
      sessionPayload: {
        access_token: '1231',
        refresh_token: '2341',
        access_expiration: 123123,
        refresh_expiration: 123123,
      },
    })

    await createController().refresh(request, response)

    expect(response.send).toHaveBeenCalledWith({
      session: {
        access_token: '1231',
        refresh_token: '2341',
        access_expiration: 123123,
        refresh_expiration: 123123,
      },
    })
  })

  it('should return bad request if tokens are missing from refresh token request', async () => {
    const httpResponse = <results.JsonResult>await createController().refresh(request, response)
    expect(httpResponse.statusCode).toEqual(400)
  })

  it('should return bad request upon failed tokens refreshing', async () => {
    request.body.access_token = '123'
    request.body.refresh_token = '234'

    refreshSessionToken.execute = jest.fn().mockReturnValue({
      success: false,
      errorTag: 'test',
      errorMessage: 'something bad happened',
    })

    const httpResponse = <results.JsonResult>await createController().refresh(request, response)

    expect(httpResponse.json).toEqual({
      error: {
        tag: 'test',
        message: 'something bad happened',
      },
    })
    expect(httpResponse.statusCode).toEqual(400)
  })

  it('should delete a specific session for current user', async () => {
    response.locals = {
      user: {
        uuid: '123',
      },
      session: {
        uuid: '234',
      },
    }
    request.body.uuid = '123'

    await createController().deleteSession(request, response)

    expect(deleteSessionForUser.execute).toBeCalledWith({
      userUuid: '123',
      sessionUuid: '123',
    })

    expect(response.status).toHaveBeenCalledWith(204)
  })

  it('should not delete a specific session is current session has read only access', async () => {
    response.locals = {
      user: {
        uuid: '123',
      },
      session: {
        uuid: '234',
      },
    }
    request.body.uuid = '123'
    response.locals.readOnlyAccess = true

    const httpResponse = <results.JsonResult>await createController().deleteSession(request, response)
    const result = await httpResponse.executeAsync()

    expect(deleteSessionForUser.execute).not.toHaveBeenCalled()

    expect(result.statusCode).toEqual(401)
  })

  it('should not delete a specific session if request is missing params', async () => {
    response.locals = {
      user: {
        uuid: '123',
      },
      session: {
        uuid: '234',
      },
    }

    const httpResponse = <results.JsonResult>await createController().deleteSession(request, response)

    expect(deleteSessionForUser.execute).not.toHaveBeenCalled()

    expect(httpResponse.statusCode).toEqual(400)
  })

  it('should not delete a specific session if it is the current session', async () => {
    response.locals = {
      user: {
        uuid: '123',
      },
      session: {
        uuid: '234',
      },
    }
    request.body.uuid = '234'

    const httpResponse = <results.JsonResult>await createController().deleteSession(request, response)

    expect(deleteSessionForUser.execute).not.toHaveBeenCalled()

    expect(httpResponse.statusCode).toEqual(400)
  })

  it('should respond with failure if deleting a specific session fails', async () => {
    response.locals = {
      user: {
        uuid: '123',
      },
      session: {
        uuid: '234',
      },
    }
    request.body.uuid = '123'

    deleteSessionForUser.execute = jest.fn().mockReturnValue({ success: false })

    const httpResponse = <results.JsonResult>await createController().deleteSession(request, response)

    expect(httpResponse.statusCode).toEqual(400)
  })

  it('should delete all sessions except current for current user', async () => {
    response.locals = {
      user: {
        uuid: '123',
      },
      session: {
        uuid: '234',
      },
    }
    await createController().deleteAllSessions(request, response)

    expect(deletePreviousSessionsForUser.execute).toHaveBeenCalledWith({
      userUuid: '123',
      currentSessionUuid: '234',
    })

    expect(response.status).toHaveBeenCalledWith(204)
    expect(response.send).toHaveBeenCalled()
  })

  it('should not delete all sessions if current sessions has read only access', async () => {
    response.locals = {
      user: {
        uuid: '123',
      },
      session: {
        uuid: '234',
      },
    }
    response.locals.readOnlyAccess = true

    const httpResponse = <results.JsonResult>await createController().deleteAllSessions(request, response)
    const result = await httpResponse.executeAsync()

    expect(deletePreviousSessionsForUser.execute).not.toHaveBeenCalled()

    expect(result.statusCode).toEqual(401)
  })

  it('should return unauthorized if current user is missing', async () => {
    response.locals = {
      session: {
        uuid: '234',
      },
    }
    const httpResponse = <results.JsonResult>await createController().deleteAllSessions(request, response)

    expect(httpResponse.json).toEqual({ error: { message: 'No session exists with the provided identifier.' } })
    expect(httpResponse.statusCode).toEqual(401)
  })
})

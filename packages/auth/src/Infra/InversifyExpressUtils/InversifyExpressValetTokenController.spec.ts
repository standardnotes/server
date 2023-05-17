import 'reflect-metadata'

import { Request, Response } from 'express'
import { results } from 'inversify-express-utils'
import { InversifyExpressValetTokenController } from './InversifyExpressValetTokenController'
import { CreateValetToken } from '../../Domain/UseCase/CreateValetToken/CreateValetToken'
import { ControllerContainerInterface } from '@standardnotes/domain-core'

describe('ValetTokenController', () => {
  let createValetToken: CreateValetToken
  let request: Request
  let response: Response
  let controllerContainer: ControllerContainerInterface

  const createController = () => new InversifyExpressValetTokenController(createValetToken, controllerContainer)

  beforeEach(() => {
    controllerContainer = {} as jest.Mocked<ControllerContainerInterface>
    controllerContainer.register = jest.fn()

    createValetToken = {} as jest.Mocked<CreateValetToken>
    createValetToken.execute = jest.fn().mockReturnValue({ success: true, valetToken: 'foobar' })

    request = {
      body: {
        operation: 'write',
        resources: [{ remoteIdentifier: '00000000-0000-0000-0000-000000000000' }],
      },
    } as jest.Mocked<Request>

    response = {
      locals: {},
    } as jest.Mocked<Response>

    response.locals.user = { uuid: '1-2-3' }
  })

  it('should create a valet token', async () => {
    const httpResponse = <results.JsonResult>await createController().create(request, response)
    const result = await httpResponse.executeAsync()

    expect(createValetToken.execute).toHaveBeenCalledWith({
      operation: 'write',
      userUuid: '1-2-3',
      resources: [{ remoteIdentifier: '00000000-0000-0000-0000-000000000000' }],
    })
    expect(await result.content.readAsStringAsync()).toEqual('{"success":true,"valetToken":"foobar"}')
  })

  it('should not create a valet token if the remote resource identifier is not a valid uuid', async () => {
    request.body.resources = ['00000000-0000-0000-0000-000000000000', 'invalid-uuid']

    const httpResponse = <results.JsonResult>await createController().create(request, response)
    const result = await httpResponse.executeAsync()

    expect(createValetToken.execute).not.toHaveBeenCalled()

    expect(result.statusCode).toEqual(400)
  })

  it('should create a read valet token for read only access session', async () => {
    response.locals.readOnlyAccess = true
    request.body.operation = 'read'

    const httpResponse = <results.JsonResult>await createController().create(request, response)
    const result = await httpResponse.executeAsync()

    expect(createValetToken.execute).toHaveBeenCalledWith({
      operation: 'read',
      userUuid: '1-2-3',
      resources: [{ remoteIdentifier: '00000000-0000-0000-0000-000000000000' }],
    })
    expect(await result.content.readAsStringAsync()).toEqual('{"success":true,"valetToken":"foobar"}')
  })

  it('should not create a write valet token if session has read only access', async () => {
    response.locals.readOnlyAccess = true
    request.body.operation = 'write'

    const httpResponse = <results.JsonResult>await createController().create(request, response)
    const result = await httpResponse.executeAsync()

    expect(createValetToken.execute).not.toHaveBeenCalled()

    expect(result.statusCode).toEqual(401)
  })

  it('should not create a delete valet token if session has read only access', async () => {
    response.locals.readOnlyAccess = true
    request.body.operation = 'delete'

    const httpResponse = <results.JsonResult>await createController().create(request, response)
    const result = await httpResponse.executeAsync()

    expect(createValetToken.execute).not.toHaveBeenCalled()

    expect(result.statusCode).toEqual(401)
  })

  it('should not create a valet token if use case fails', async () => {
    createValetToken.execute = jest.fn().mockReturnValue({ success: false })

    const httpResponse = <results.JsonResult>await createController().create(request, response)
    const result = await httpResponse.executeAsync()

    expect(createValetToken.execute).toHaveBeenCalledWith({
      operation: 'write',
      userUuid: '1-2-3',
      resources: [{ remoteIdentifier: '00000000-0000-0000-0000-000000000000' }],
    })

    expect(await result.content.readAsStringAsync()).toEqual('{"success":false}')
  })
})

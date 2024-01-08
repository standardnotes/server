import { ControllerContainerInterface, Uuid } from '@standardnotes/domain-core'
import { Request, Response } from 'express'
import { BaseHttpController, results } from 'inversify-express-utils'
import { ErrorTag } from '@standardnotes/responses'
import { ValetTokenOperation } from '@standardnotes/security'

import { CreateValetToken } from '../../../Domain/UseCase/CreateValetToken/CreateValetToken'
import { CreateValetTokenPayload } from '../../../Domain/ValetToken/CreateValetTokenPayload'
import { ResponseLocals } from '../ResponseLocals'

export class BaseValetTokenController extends BaseHttpController {
  constructor(
    protected createValetKey: CreateValetToken,
    private controllerContainer?: ControllerContainerInterface,
  ) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('auth.valet-tokens.create', this.create.bind(this))
    }
  }

  public async create(request: Request, response: Response): Promise<results.JsonResult> {
    const locals = response.locals as ResponseLocals

    const payload: CreateValetTokenPayload = request.body

    if (locals.readOnlyAccess && payload.operation !== 'read') {
      return this.json(
        {
          error: {
            tag: ErrorTag.ReadOnlyAccess,
            message: 'Session has read-only access.',
          },
        },
        401,
      )
    }

    for (const resource of payload.resources) {
      const resourceUuidOrError = Uuid.create(resource.remoteIdentifier)
      if (resourceUuidOrError.isFailed()) {
        return this.json(
          {
            error: {
              tag: ErrorTag.ParametersInvalid,
              message: 'Invalid remote resource identifier.',
            },
          },
          400,
        )
      }
    }

    const createValetKeyResponse = await this.createValetKey.execute({
      userUuid: locals.user.uuid,
      operation: payload.operation as ValetTokenOperation,
      resources: payload.resources,
    })

    if (!createValetKeyResponse.success) {
      return this.json(createValetKeyResponse, 403)
    }

    return this.json(createValetKeyResponse)
  }
}

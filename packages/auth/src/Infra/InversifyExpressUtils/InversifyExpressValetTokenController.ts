import { inject } from 'inversify'
import { Request, Response } from 'express'
import {
  BaseHttpController,
  controller,
  httpPost,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'
import { CreateValetTokenPayload, ErrorTag } from '@standardnotes/responses'
import { ValetTokenOperation } from '@standardnotes/security'
import { Uuid } from '@standardnotes/domain-core'
import TYPES from '../../Bootstrap/Types'
import { CreateValetToken } from '../../Domain/UseCase/CreateValetToken/CreateValetToken'

@controller('/valet-tokens', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
export class InversifyExpressValetTokenController extends BaseHttpController {
  constructor(@inject(TYPES.Auth_CreateValetToken) protected createValetKey: CreateValetToken) {
    super()
  }

  @httpPost('/')
  public async create(request: Request, response: Response): Promise<results.JsonResult> {
    const payload: CreateValetTokenPayload = request.body

    if (response.locals.readOnlyAccess && payload.operation !== 'read') {
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
      userUuid: response.locals.user.uuid,
      operation: payload.operation as ValetTokenOperation,
      resources: payload.resources,
    })

    if (!createValetKeyResponse.success) {
      return this.json(createValetKeyResponse, 403)
    }

    return this.json(createValetKeyResponse)
  }
}

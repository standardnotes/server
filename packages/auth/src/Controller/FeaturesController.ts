import { Request, Response } from 'express'
import { inject } from 'inversify'
import {
  BaseHttpController,
  controller,
  httpGet,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { GetUserFeatures } from '../Domain/UseCase/GetUserFeatures/GetUserFeatures'
import { ControllerContainerInterface } from '@standardnotes/domain-core'

@controller('/users/:userUuid/features')
export class FeaturesController extends BaseHttpController {
  constructor(
    @inject(TYPES.Auth_GetUserFeatures) private doGetUserFeatures: GetUserFeatures,
    @inject(TYPES.Auth_ControllerContainer) private controllerContainer: ControllerContainerInterface,
  ) {
    super()

    this.controllerContainer.register('auth.users.getFeatures', this.getFeatures.bind(this))
  }

  @httpGet('/', TYPES.Auth_ApiGatewayAuthMiddleware)
  async getFeatures(request: Request, response: Response): Promise<results.JsonResult> {
    if (request.params.userUuid !== response.locals.user.uuid) {
      return this.json(
        {
          error: {
            message: 'Operation not allowed.',
          },
        },
        401,
      )
    }

    const result = await this.doGetUserFeatures.execute({
      userUuid: request.params.userUuid,
      offline: false,
    })

    if (result.success) {
      return this.json(result)
    }

    return this.json(result, 400)
  }
}

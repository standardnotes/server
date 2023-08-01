import { ControllerContainerInterface } from '@standardnotes/domain-core'
import { Request, Response } from 'express'

import { GetUserFeatures } from '../../../Domain/UseCase/GetUserFeatures/GetUserFeatures'
import { BaseHttpController, results } from 'inversify-express-utils'

export class BaseFeaturesController extends BaseHttpController {
  constructor(
    protected doGetUserFeatures: GetUserFeatures,
    private controllerContainer?: ControllerContainerInterface,
  ) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('auth.users.getFeatures', this.getFeatures.bind(this))
    }
  }

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

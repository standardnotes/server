import { ControllerContainerInterface } from '@standardnotes/domain-core'
import { BaseHttpController, results } from 'inversify-express-utils'
import { Request, Response } from 'express'

import { GetSetting } from '../../../Domain/UseCase/GetSetting/GetSetting'

export class BaseSubscriptionSettingsController extends BaseHttpController {
  constructor(protected doGetSetting: GetSetting, private controllerContainer?: ControllerContainerInterface) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('auth.users.getSubscriptionSetting', this.getSubscriptionSetting.bind(this))
    }
  }

  async getSubscriptionSetting(request: Request, response: Response): Promise<results.JsonResult> {
    const resultOrError = await this.doGetSetting.execute({
      userUuid: response.locals.user.uuid,
      settingName: request.params.subscriptionSettingName.toUpperCase(),
    })

    if (resultOrError.isFailed()) {
      return this.json(
        {
          error: {
            message: resultOrError.getError(),
          },
        },
        400,
      )
    }

    return this.json({
      success: true,
      ...resultOrError.getValue(),
    })
  }
}

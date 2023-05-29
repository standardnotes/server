import { ControllerContainerInterface } from '@standardnotes/domain-core'
import { BaseHttpController, results } from 'inversify-express-utils'
import { Request, Response } from 'express'

import { GetSetting } from '../../../Domain/UseCase/GetSetting/GetSetting'

export class HomeServerSubscriptionSettingsController extends BaseHttpController {
  constructor(protected doGetSetting: GetSetting, private controllerContainer?: ControllerContainerInterface) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('auth.users.getSubscriptionSetting', this.getSubscriptionSetting.bind(this))
    }
  }

  async getSubscriptionSetting(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.doGetSetting.execute({
      userUuid: response.locals.user.uuid,
      settingName: request.params.subscriptionSettingName.toUpperCase(),
    })

    if (result.success) {
      return this.json(result)
    }

    return this.json(result, 400)
  }
}

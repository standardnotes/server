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
import { GetSetting } from '../Domain/UseCase/GetSetting/GetSetting'

@controller('/users/:userUuid')
export class SubscriptionSettingsController extends BaseHttpController {
  constructor(@inject(TYPES.Auth_GetSetting) private doGetSetting: GetSetting) {
    super()
  }

  @httpGet('/subscription-settings/:subscriptionSettingName', TYPES.Auth_ApiGatewayAuthMiddleware)
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

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
import { GetSubscriptionSetting } from '../Domain/UseCase/GetSubscriptionSetting/GetSubscriptionSetting'

@controller('/users/:userUuid')
export class SubscriptionSettingsController extends BaseHttpController {
  constructor(@inject(TYPES.GetSubscriptionSetting) private doGetSubscriptionSetting: GetSubscriptionSetting) {
    super()
  }

  @httpGet('/subscription-settings/:subscriptionSettingName', TYPES.ApiGatewayAuthMiddleware)
  async getSubscriptionSetting(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.doGetSubscriptionSetting.execute({
      userUuid: response.locals.user.uuid,
      subscriptionSettingName: request.params.subscriptionSettingName,
    })

    if (result.success) {
      return this.json(result)
    }

    return this.json(result, 400)
  }
}

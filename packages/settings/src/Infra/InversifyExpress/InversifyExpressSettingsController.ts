import { Request } from 'express'
import { BaseHttpController, controller, httpPost, results } from 'inversify-express-utils'
import { inject } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { SettingsController } from '../../Controller/SettingsController'

@controller('/users/:userUuid/settings', TYPES.ApiGatewayAuthMiddleware)
export class InversifyExpressSettingsController extends BaseHttpController {
  constructor(@inject(TYPES.SettingsController) private settingsController: SettingsController) {
    super()
  }

  @httpPost('/mute-emails')
  public async muteAllEmails(request: Request): Promise<results.JsonResult> {
    const result = await this.settingsController.muteAllEmails({
      userUuid: request.params.userUuid,
    })

    return this.json(result.data, result.status)
  }
}

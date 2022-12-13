import { BaseHttpController, controller } from 'inversify-express-utils'
import { inject } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { SettingsController } from '../../Controller/SettingsController'

@controller('/users/:userUuid/settings', TYPES.ApiGatewayAuthMiddleware)
export class InversifyExpressSettingsController extends BaseHttpController {
  constructor(@inject(TYPES.SettingsController) private settingsController: SettingsController) {
    super()
  }
}

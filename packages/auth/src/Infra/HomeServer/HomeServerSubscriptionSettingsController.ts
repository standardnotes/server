import { ControllerContainerInterface } from '@standardnotes/domain-core'

import { GetSetting } from '../../Domain/UseCase/GetSetting/GetSetting'
import { InversifyExpressSubscriptionSettingsController } from '../InversifyExpressUtils/InversifyExpressSubscriptionSettingsController'

export class HomeServerSubscriptionSettingsController extends InversifyExpressSubscriptionSettingsController {
  constructor(override doGetSetting: GetSetting, private controllerContainer: ControllerContainerInterface) {
    super(doGetSetting)

    this.controllerContainer.register('auth.users.getSubscriptionSetting', this.getSubscriptionSetting.bind(this))
  }
}

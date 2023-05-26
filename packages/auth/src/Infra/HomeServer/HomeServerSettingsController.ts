import { ControllerContainerInterface } from '@standardnotes/domain-core'
import { DeleteSetting } from '../../Domain/UseCase/DeleteSetting/DeleteSetting'
import { GetSetting } from '../../Domain/UseCase/GetSetting/GetSetting'
import { GetSettings } from '../../Domain/UseCase/GetSettings/GetSettings'
import { UpdateSetting } from '../../Domain/UseCase/UpdateSetting/UpdateSetting'
import { InversifyExpressSettingsController } from '../InversifyExpressUtils/InversifyExpressSettingsController'

export class HomeServerSettingsController extends InversifyExpressSettingsController {
  constructor(
    override doGetSettings: GetSettings,
    override doGetSetting: GetSetting,
    override doUpdateSetting: UpdateSetting,
    override doDeleteSetting: DeleteSetting,
    private controllerContainer: ControllerContainerInterface,
  ) {
    super(doGetSettings, doGetSetting, doUpdateSetting, doDeleteSetting)

    this.controllerContainer.register('auth.users.getSettings', this.getSettings.bind(this))
    this.controllerContainer.register('auth.users.getSetting', this.getSetting.bind(this))
    this.controllerContainer.register('auth.users.updateSetting', this.updateSetting.bind(this))
    this.controllerContainer.register('auth.users.deleteSetting', this.deleteSetting.bind(this))
  }
}

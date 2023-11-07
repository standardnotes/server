import { Request, Response } from 'express'
import { inject } from 'inversify'
import {
  controller,
  httpDelete,
  httpGet,
  httpPut,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { DeleteSetting } from '../../Domain/UseCase/DeleteSetting/DeleteSetting'
import { GetSetting } from '../../Domain/UseCase/GetSetting/GetSetting'
import { BaseSettingsController } from './Base/BaseSettingsController'
import { SetSettingValue } from '../../Domain/UseCase/SetSettingValue/SetSettingValue'
import { MapperInterface } from '@standardnotes/domain-core'
import { Setting } from '../../Domain/Setting/Setting'
import { SubscriptionSetting } from '../../Domain/Setting/SubscriptionSetting'
import { SettingHttpRepresentation } from '../../Mapping/Http/SettingHttpRepresentation'
import { SubscriptionSettingHttpRepresentation } from '../../Mapping/Http/SubscriptionSettingHttpRepresentation'
import { GetAllSettingsForUser } from '../../Domain/UseCase/GetAllSettingsForUser/GetAllSettingsForUser'
import { TriggerPostSettingUpdateActions } from '../../Domain/UseCase/TriggerPostSettingUpdateActions/TriggerPostSettingUpdateActions'
import { Logger } from 'winston'

@controller('/users/:userUuid')
export class AnnotatedSettingsController extends BaseSettingsController {
  constructor(
    @inject(TYPES.Auth_GetAllSettingsForUser) override doGetSettings: GetAllSettingsForUser,
    @inject(TYPES.Auth_GetSetting) override doGetSetting: GetSetting,
    @inject(TYPES.Auth_SetSettingValue) override setSettingValue: SetSettingValue,
    @inject(TYPES.Auth_TriggerPostSettingUpdateActions)
    override triggerPostSettingUpdateActions: TriggerPostSettingUpdateActions,
    @inject(TYPES.Auth_DeleteSetting) override doDeleteSetting: DeleteSetting,
    @inject(TYPES.Auth_SettingHttpMapper) settingHttMapper: MapperInterface<Setting, SettingHttpRepresentation>,
    @inject(TYPES.Auth_SubscriptionSettingHttpMapper)
    subscriptionSettingHttpMapper: MapperInterface<SubscriptionSetting, SubscriptionSettingHttpRepresentation>,
    @inject(TYPES.Auth_Logger) logger: Logger,
  ) {
    super(
      doGetSettings,
      doGetSetting,
      setSettingValue,
      triggerPostSettingUpdateActions,
      doDeleteSetting,
      settingHttMapper,
      subscriptionSettingHttpMapper,
      logger,
    )
  }

  @httpGet('/settings', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  override async getSettings(request: Request, response: Response): Promise<results.JsonResult> {
    return super.getSettings(request, response)
  }

  @httpGet('/settings/:settingName', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  override async getSetting(request: Request, response: Response): Promise<results.JsonResult> {
    return super.getSetting(request, response)
  }

  @httpPut('/settings', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  override async updateSetting(
    request: Request,
    response: Response,
  ): Promise<results.JsonResult | results.StatusCodeResult> {
    return super.updateSetting(request, response)
  }

  @httpDelete('/settings/:settingName', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  override async deleteSetting(request: Request, response: Response): Promise<results.JsonResult> {
    return super.deleteSetting(request, response)
  }
}

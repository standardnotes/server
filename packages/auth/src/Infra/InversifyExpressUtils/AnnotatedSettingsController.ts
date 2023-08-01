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
import { GetSettings } from '../../Domain/UseCase/GetSettings/GetSettings'
import { UpdateSetting } from '../../Domain/UseCase/UpdateSetting/UpdateSetting'
import { BaseSettingsController } from './Base/BaseSettingsController'

@controller('/users/:userUuid')
export class AnnotatedSettingsController extends BaseSettingsController {
  constructor(
    @inject(TYPES.Auth_GetSettings) override doGetSettings: GetSettings,
    @inject(TYPES.Auth_GetSetting) override doGetSetting: GetSetting,
    @inject(TYPES.Auth_UpdateSetting) override doUpdateSetting: UpdateSetting,
    @inject(TYPES.Auth_DeleteSetting) override doDeleteSetting: DeleteSetting,
  ) {
    super(doGetSettings, doGetSetting, doUpdateSetting, doDeleteSetting)
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

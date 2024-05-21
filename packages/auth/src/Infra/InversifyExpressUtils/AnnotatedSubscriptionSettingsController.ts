import { Request, Response } from 'express'
import { inject } from 'inversify'
import {
  controller,
  httpGet,
  httpPut,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { BaseSubscriptionSettingsController } from './Base/BaseSubscriptionSettingsController'
import { GetSharedOrRegularSubscriptionForUser } from '../../Domain/UseCase/GetSharedOrRegularSubscriptionForUser/GetSharedOrRegularSubscriptionForUser'
import { GetSubscriptionSetting } from '../../Domain/UseCase/GetSubscriptionSetting/GetSubscriptionSetting'
import { MapperInterface } from '@standardnotes/domain-core'
import { SubscriptionSetting } from '../../Domain/Setting/SubscriptionSetting'
import { SubscriptionSettingHttpRepresentation } from '../../Mapping/Http/SubscriptionSettingHttpRepresentation'
import { SetSubscriptionSettingValue } from '../../Domain/UseCase/SetSubscriptionSettingValue/SetSubscriptionSettingValue'
import { TriggerPostSettingUpdateActions } from '../../Domain/UseCase/TriggerPostSettingUpdateActions/TriggerPostSettingUpdateActions'
import { Logger } from 'winston'

@controller('/users/:userUuid')
export class AnnotatedSubscriptionSettingsController extends BaseSubscriptionSettingsController {
  constructor(
    @inject(TYPES.Auth_GetSubscriptionSetting) override doGetSetting: GetSubscriptionSetting,
    @inject(TYPES.Auth_GetSharedOrRegularSubscriptionForUser)
    override getSharedOrRegularSubscription: GetSharedOrRegularSubscriptionForUser,
    @inject(TYPES.Auth_SetSubscriptionSettingValue) override setSubscriptionSettingValue: SetSubscriptionSettingValue,
    @inject(TYPES.Auth_TriggerPostSettingUpdateActions)
    override triggerPostSettingUpdateActions: TriggerPostSettingUpdateActions,
    @inject(TYPES.Auth_SubscriptionSettingHttpMapper)
    override subscriptionSettingMapper: MapperInterface<SubscriptionSetting, SubscriptionSettingHttpRepresentation>,
    @inject(TYPES.Auth_Logger) override logger: Logger,
  ) {
    super(
      doGetSetting,
      getSharedOrRegularSubscription,
      setSubscriptionSettingValue,
      triggerPostSettingUpdateActions,
      subscriptionSettingMapper,
      logger,
    )
  }

  @httpGet('/subscription-settings/:subscriptionSettingName', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  override async getSubscriptionSetting(request: Request, response: Response): Promise<results.JsonResult> {
    return super.getSubscriptionSetting(request, response)
  }

  @httpPut('/subscription-settings', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  override async updateSubscriptionSetting(
    request: Request,
    response: Response,
  ): Promise<results.JsonResult | results.StatusCodeResult> {
    return super.updateSubscriptionSetting(request, response)
  }
}

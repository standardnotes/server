import { Request, Response } from 'express'
import { inject } from 'inversify'
import {
  controller,
  httpGet,
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

@controller('/users/:userUuid')
export class AnnotatedSubscriptionSettingsController extends BaseSubscriptionSettingsController {
  constructor(
    @inject(TYPES.Auth_GetSetting) override doGetSetting: GetSubscriptionSetting,
    @inject(TYPES.Auth_GetSharedOrRegularSubscriptionForUser)
    doGetSharedOrRegularSubscriptionForUser: GetSharedOrRegularSubscriptionForUser,
    @inject(TYPES.Auth_SubscriptionSettingHttpMapper)
    override subscriptionSettingMapper: MapperInterface<SubscriptionSetting, SubscriptionSettingHttpRepresentation>,
  ) {
    super(doGetSetting, doGetSharedOrRegularSubscriptionForUser, subscriptionSettingMapper)
  }

  @httpGet('/subscription-settings/:subscriptionSettingName', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  override async getSubscriptionSetting(request: Request, response: Response): Promise<results.JsonResult> {
    return super.getSubscriptionSetting(request, response)
  }
}

import { ControllerContainerInterface, MapperInterface } from '@standardnotes/domain-core'
import { BaseHttpController, results } from 'inversify-express-utils'
import { Request, Response } from 'express'

import { GetSubscriptionSetting } from '../../../Domain/UseCase/GetSubscriptionSetting/GetSubscriptionSetting'
import { GetSharedOrRegularSubscriptionForUser } from '../../../Domain/UseCase/GetSharedOrRegularSubscriptionForUser/GetSharedOrRegularSubscriptionForUser'
import { SubscriptionSetting } from '../../../Domain/Setting/SubscriptionSetting'
import { SubscriptionSettingHttpRepresentation } from '../../../Mapping/Http/SubscriptionSettingHttpRepresentation'
import { ResponseLocals } from '../ResponseLocals'

export class BaseSubscriptionSettingsController extends BaseHttpController {
  constructor(
    protected doGetSetting: GetSubscriptionSetting,
    protected getSharedOrRegularSubscription: GetSharedOrRegularSubscriptionForUser,
    protected subscriptionSettingMapper: MapperInterface<SubscriptionSetting, SubscriptionSettingHttpRepresentation>,
    private controllerContainer?: ControllerContainerInterface,
  ) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('auth.users.getSubscriptionSetting', this.getSubscriptionSetting.bind(this))
    }
  }

  async getSubscriptionSetting(request: Request, response: Response): Promise<results.JsonResult> {
    const locals = response.locals as ResponseLocals

    const subscriptionOrError = await this.getSharedOrRegularSubscription.execute({
      userUuid: locals.user.uuid,
    })
    if (subscriptionOrError.isFailed()) {
      return this.json(
        {
          error: {
            message: subscriptionOrError.getError(),
          },
        },
        400,
      )
    }
    const subscription = subscriptionOrError.getValue()

    const resultOrError = await this.doGetSetting.execute({
      userSubscriptionUuid: subscription.uuid,
      allowSensitiveRetrieval: false,
      settingName: request.params.subscriptionSettingName.toUpperCase(),
    })

    if (resultOrError.isFailed()) {
      return this.json(
        {
          error: {
            message: resultOrError.getError(),
          },
        },
        400,
      )
    }

    const settingAndValue = resultOrError.getValue()

    return this.json({
      success: true,
      setting: this.subscriptionSettingMapper.toProjection(settingAndValue.setting),
    })
  }
}

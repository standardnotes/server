import { ControllerContainerInterface, MapperInterface } from '@standardnotes/domain-core'
import { BaseHttpController, results } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Logger } from 'winston'
import { ErrorTag } from '@standardnotes/responses'

import { GetSubscriptionSetting } from '../../../Domain/UseCase/GetSubscriptionSetting/GetSubscriptionSetting'
import { GetSharedOrRegularSubscriptionForUser } from '../../../Domain/UseCase/GetSharedOrRegularSubscriptionForUser/GetSharedOrRegularSubscriptionForUser'
import { SubscriptionSetting } from '../../../Domain/Setting/SubscriptionSetting'
import { SubscriptionSettingHttpRepresentation } from '../../../Mapping/Http/SubscriptionSettingHttpRepresentation'
import { ResponseLocals } from '../ResponseLocals'
import { SetSubscriptionSettingValue } from '../../../Domain/UseCase/SetSubscriptionSettingValue/SetSubscriptionSettingValue'
import { TriggerPostSettingUpdateActions } from '../../../Domain/UseCase/TriggerPostSettingUpdateActions/TriggerPostSettingUpdateActions'

export class BaseSubscriptionSettingsController extends BaseHttpController {
  constructor(
    protected doGetSetting: GetSubscriptionSetting,
    protected getSharedOrRegularSubscription: GetSharedOrRegularSubscriptionForUser,
    protected setSubscriptionSettingValue: SetSubscriptionSettingValue,
    protected triggerPostSettingUpdateActions: TriggerPostSettingUpdateActions,
    protected subscriptionSettingMapper: MapperInterface<SubscriptionSetting, SubscriptionSettingHttpRepresentation>,
    protected logger: Logger,
    private controllerContainer?: ControllerContainerInterface,
  ) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('auth.users.getSubscriptionSetting', this.getSubscriptionSetting.bind(this))
      this.controllerContainer.register(
        'auth.users.updateSubscriptionSetting',
        this.updateSubscriptionSetting.bind(this),
      )
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

  async updateSubscriptionSetting(
    request: Request,
    response: Response,
  ): Promise<results.JsonResult | results.StatusCodeResult> {
    const locals = response.locals as ResponseLocals

    if (locals.readOnlyAccess) {
      return this.json(
        {
          error: {
            tag: ErrorTag.ReadOnlyAccess,
            message: 'Session has read-only access.',
          },
        },
        401,
      )
    }

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

    const { name, value } = request.body

    const result = await this.setSubscriptionSettingValue.execute({
      settingName: name,
      value,
      userSubscriptionUuid: subscription.uuid,
      checkUserPermissions: true,
    })

    if (result.isFailed()) {
      return this.json(
        {
          error: {
            message: result.getError(),
          },
        },
        400,
      )
    }
    const subscriptionSetting = result.getValue()

    const triggerResult = await this.triggerPostSettingUpdateActions.execute({
      updatedSettingName: subscriptionSetting.props.name,
      userUuid: locals.user.uuid,
      userEmail: locals.user.email,
      unencryptedValue: value,
    })
    if (triggerResult.isFailed()) {
      this.logger.error(`Failed to trigger post setting update actions: ${triggerResult.getError()}`)
    }

    return this.json({
      success: true,
      setting: subscriptionSetting.props.sensitive
        ? undefined
        : this.subscriptionSettingMapper.toProjection(subscriptionSetting),
    })
  }
}

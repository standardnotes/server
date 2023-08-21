import { SettingName } from '@standardnotes/settings'
import { inject, injectable } from 'inversify'
import { Result, UseCaseInterface } from '@standardnotes/domain-core'

import TYPES from '../../../Bootstrap/Types'
import { SettingProjector } from '../../../Projection/SettingProjector'
import { SettingServiceInterface } from '../../Setting/SettingServiceInterface'
import { SubscriptionSettingServiceInterface } from '../../Setting/SubscriptionSettingServiceInterface'
import { SubscriptionSettingProjector } from '../../../Projection/SubscriptionSettingProjector'
import { UserSubscriptionServiceInterface } from '../../Subscription/UserSubscriptionServiceInterface'

import { GetSettingDto } from './GetSettingDto'
import { GetSettingResponse } from './GetSettingResponse'
import { UserSubscription } from '../../Subscription/UserSubscription'

@injectable()
export class GetSetting implements UseCaseInterface<GetSettingResponse> {
  constructor(
    @inject(TYPES.Auth_SettingProjector) private settingProjector: SettingProjector,
    @inject(TYPES.Auth_SubscriptionSettingProjector) private subscriptionSettingProjector: SubscriptionSettingProjector,
    @inject(TYPES.Auth_SettingService) private settingService: SettingServiceInterface,
    @inject(TYPES.Auth_SubscriptionSettingService)
    private subscriptionSettingService: SubscriptionSettingServiceInterface,
    @inject(TYPES.Auth_UserSubscriptionService) private userSubscriptionService: UserSubscriptionServiceInterface,
  ) {}

  async execute(dto: GetSettingDto): Promise<Result<GetSettingResponse>> {
    const settingNameOrError = SettingName.create(dto.settingName)
    if (settingNameOrError.isFailed()) {
      return Result.fail(settingNameOrError.getError())
    }
    const settingName = settingNameOrError.getValue()

    if (settingName.isASubscriptionSetting()) {
      const { regularSubscription, sharedSubscription } =
        await this.userSubscriptionService.findRegularSubscriptionForUserUuid(dto.userUuid)
      let subscription: UserSubscription | null
      if (settingName.isARegularOnlySubscriptionSetting()) {
        subscription = regularSubscription
      } else {
        subscription = sharedSubscription ?? regularSubscription
      }

      if (!subscription) {
        return Result.fail('No subscription found.')
      }

      const subscriptionSetting = await this.subscriptionSettingService.findSubscriptionSettingWithDecryptedValue({
        userUuid: dto.userUuid,
        subscriptionSettingName: settingName,
        userSubscriptionUuid: subscription.uuid,
      })

      if (subscriptionSetting === null) {
        return Result.fail(`Subscription setting ${settingName.value} for user ${dto.userUuid} not found!`)
      }

      if (subscriptionSetting.sensitive && !dto.allowSensitiveRetrieval) {
        return Result.ok({
          sensitive: true,
        })
      }

      const simpleSubscriptionSetting = await this.subscriptionSettingProjector.projectSimple(subscriptionSetting)

      return Result.ok({
        userUuid: dto.userUuid,
        setting: simpleSubscriptionSetting,
      })
    }

    const setting = await this.settingService.findSettingWithDecryptedValue({
      userUuid: dto.userUuid,
      settingName,
    })

    if (setting === null) {
      return Result.fail(`Setting ${settingName.value} for user ${dto.userUuid} not found!`)
    }

    if (setting.sensitive && !dto.allowSensitiveRetrieval) {
      return Result.ok({
        sensitive: true,
      })
    }

    const simpleSetting = await this.settingProjector.projectSimple(setting)

    return Result.ok({
      userUuid: dto.userUuid,
      setting: simpleSetting,
    })
  }
}

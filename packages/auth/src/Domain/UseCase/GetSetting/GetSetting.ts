import { SettingName } from '@standardnotes/settings'
import { inject, injectable } from 'inversify'

import { UseCaseInterface } from '../UseCaseInterface'
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
export class GetSetting implements UseCaseInterface {
  constructor(
    @inject(TYPES.SettingProjector) private settingProjector: SettingProjector,
    @inject(TYPES.SubscriptionSettingProjector) private subscriptionSettingProjector: SubscriptionSettingProjector,
    @inject(TYPES.SettingService) private settingService: SettingServiceInterface,
    @inject(TYPES.SubscriptionSettingService) private subscriptionSettingService: SubscriptionSettingServiceInterface,
    @inject(TYPES.UserSubscriptionService) private userSubscriptionService: UserSubscriptionServiceInterface,
  ) {}

  async execute(dto: GetSettingDto): Promise<GetSettingResponse> {
    const settingNameOrError = SettingName.create(dto.settingName)
    if (settingNameOrError.isFailed()) {
      return {
        success: false,
        error: {
          message: settingNameOrError.getError(),
        },
      }
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
        return {
          success: false,
          error: {
            message: 'No subscription found.',
          },
        }
      }

      const subscriptionSetting = await this.subscriptionSettingService.findSubscriptionSettingWithDecryptedValue({
        userUuid: dto.userUuid,
        subscriptionSettingName: settingName,
        userSubscriptionUuid: subscription.uuid,
      })

      if (subscriptionSetting === null) {
        return {
          success: false,
          error: {
            message: `Subscription setting ${settingName.value} for user ${dto.userUuid} not found!`,
          },
        }
      }

      if (subscriptionSetting.sensitive && !dto.allowSensitiveRetrieval) {
        return {
          success: true,
          sensitive: true,
        }
      }

      const simpleSubscriptionSetting = await this.subscriptionSettingProjector.projectSimple(subscriptionSetting)

      return {
        success: true,
        userUuid: dto.userUuid,
        setting: simpleSubscriptionSetting,
      }
    }

    const setting = await this.settingService.findSettingWithDecryptedValue({
      userUuid: dto.userUuid,
      settingName,
    })

    if (setting === null) {
      return {
        success: false,
        error: {
          message: `Setting ${settingName.value} for user ${dto.userUuid} not found!`,
        },
      }
    }

    if (setting.sensitive && !dto.allowSensitiveRetrieval) {
      return {
        success: true,
        sensitive: true,
      }
    }

    const simpleSetting = await this.settingProjector.projectSimple(setting)

    return {
      success: true,
      userUuid: dto.userUuid,
      setting: simpleSetting,
    }
  }
}

import { Result, SettingName, SubscriptionPlanName, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { ApplyDefaultSubscriptionSettingsDTO } from './ApplyDefaultSubscriptionSettingsDTO'
import { SubscriptionSettingsAssociationServiceInterface } from '../../Setting/SubscriptionSettingsAssociationServiceInterface'
import { SettingDescription } from '../../Setting/SettingDescription'
import { UserSubscriptionRepositoryInterface } from '../../Subscription/UserSubscriptionRepositoryInterface'
import { GetSubscriptionSetting } from '../GetSubscriptionSetting/GetSubscriptionSetting'
import { SubscriptionSetting } from '../../Setting/SubscriptionSetting'
import { SetSubscriptionSettingValue } from '../SetSubscriptionSettingValue/SetSubscriptionSettingValue'

export class ApplyDefaultSubscriptionSettings implements UseCaseInterface<void> {
  constructor(
    private subscriptionSettingAssociationService: SubscriptionSettingsAssociationServiceInterface,
    private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    private getSubscriptionSetting: GetSubscriptionSetting,
    private setSubscriptionSettingValue: SetSubscriptionSettingValue,
  ) {}

  async execute(dto: ApplyDefaultSubscriptionSettingsDTO): Promise<Result<void>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const userSubscriptionUuidOrError = Uuid.create(dto.userSubscriptionUuid)
    if (userSubscriptionUuidOrError.isFailed()) {
      return Result.fail(userSubscriptionUuidOrError.getError())
    }
    const userSubscriptionUuid = userSubscriptionUuidOrError.getValue()

    const subscriptionPlanNameOrError = SubscriptionPlanName.create(dto.subscriptionPlanName)
    if (subscriptionPlanNameOrError.isFailed()) {
      return Result.fail(subscriptionPlanNameOrError.getError())
    }
    const subscriptionPlanName = subscriptionPlanNameOrError.getValue()

    const defaultSettingsWithValues =
      await this.subscriptionSettingAssociationService.getDefaultSettingsAndValuesForSubscriptionName(
        subscriptionPlanName.value,
      )
    if (defaultSettingsWithValues === undefined) {
      return Result.fail(`Could not find default settings for subscription plan ${subscriptionPlanName.value}.`)
    }

    for (const settingNameString of defaultSettingsWithValues.keys()) {
      const settingNameOrError = SettingName.create(settingNameString)
      if (settingNameOrError.isFailed()) {
        return Result.fail(settingNameOrError.getError())
      }
      const settingName = settingNameOrError.getValue()
      if (!settingName.isASubscriptionSetting()) {
        return Result.fail(`Setting ${settingName.value} is not a subscription setting!`)
      }

      const setting = defaultSettingsWithValues.get(settingName.value) as SettingDescription
      if (!setting.replaceable) {
        const existingSettingOrError = await this.findPreviousSubscriptionSetting(
          settingName,
          userSubscriptionUuid.value,
          userUuid.value,
        )
        if (!existingSettingOrError.isFailed()) {
          const existingSetting = existingSettingOrError.getValue()
          const result = await this.setSubscriptionSettingValue.execute({
            userSubscriptionUuid: existingSetting.setting.props.userSubscriptionUuid.value,
            settingName: existingSetting.setting.props.name,
            value: existingSetting.setting.props.value,
            newUserSubscriptionUuid: userSubscriptionUuid.value,
          })
          if (result.isFailed()) {
            return Result.fail(result.getError())
          }

          continue
        }
      }

      let unencryptedValue = setting.value
      if (dto.overrides && dto.overrides.has(settingName.value)) {
        unencryptedValue = dto.overrides.get(settingName.value) as string
      }

      await this.setSubscriptionSettingValue.execute({
        userSubscriptionUuid: userSubscriptionUuid.value,
        settingName: settingName.value,
        value: unencryptedValue,
      })
    }

    return Result.ok()
  }

  private async findPreviousSubscriptionSetting(
    settingName: SettingName,
    currentUserSubscriptionUuid: string,
    userUuid: string,
  ): Promise<Result<{ setting: SubscriptionSetting; decryptedValue?: string | null }>> {
    const userSubscriptions = await this.userSubscriptionRepository.findByUserUuid(userUuid)
    const previousSubscriptions = userSubscriptions.filter(
      (subscription) => subscription.uuid !== currentUserSubscriptionUuid,
    )
    const lastSubscription = previousSubscriptions.shift()

    if (!lastSubscription) {
      return Result.fail(`Could not find previous subscription for user ${userUuid}.`)
    }

    return this.getSubscriptionSetting.execute({
      userSubscriptionUuid: lastSubscription.uuid,
      settingName: settingName.value,
      allowSensitiveRetrieval: true,
      decryptWith: {
        userUuid,
      },
    })
  }
}

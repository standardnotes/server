import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { SubscriptionSetting } from '../../Setting/SubscriptionSetting'
import { SubscriptionSettingRepositoryInterface } from '../../Setting/SubscriptionSettingRepositoryInterface'
import { GetSubscriptionSettingDTO } from './GetSubscriptionSettingDTO'
import { SettingDecrypterInterface } from '../../Setting/SettingDecrypterInterface'
import { SettingName } from '@standardnotes/settings'

export class GetSubscriptionSetting
  implements UseCaseInterface<{ setting: SubscriptionSetting; decryptedValue?: string | null }>
{
  constructor(
    private subscriptionSettingRepository: SubscriptionSettingRepositoryInterface,
    private settingDecrypter: SettingDecrypterInterface,
  ) {}

  async execute(
    dto: GetSubscriptionSettingDTO,
  ): Promise<Result<{ setting: SubscriptionSetting; decryptedValue?: string | null }>> {
    const userSubscriptionUuidOrError = Uuid.create(dto.userSubscriptionUuid)
    if (userSubscriptionUuidOrError.isFailed()) {
      return Result.fail(userSubscriptionUuidOrError.getError())
    }
    const userSubscriptionUuid = userSubscriptionUuidOrError.getValue()

    const settingNameOrError = SettingName.create(dto.settingName)
    if (settingNameOrError.isFailed()) {
      return Result.fail(settingNameOrError.getError())
    }
    const settingName = settingNameOrError.getValue()

    if (!settingName.isASubscriptionSetting()) {
      return Result.fail(`Setting ${settingName.value} is not a subscription setting!`)
    }

    const subscriptionSetting = await this.subscriptionSettingRepository.findLastByNameAndUserSubscriptionUuid(
      settingName.value,
      userSubscriptionUuid,
    )
    if (subscriptionSetting === null) {
      return Result.fail(`Subscription setting ${settingName.value} for user ${dto.userSubscriptionUuid} not found!`)
    }

    if (subscriptionSetting.props.sensitive && !dto.allowSensitiveRetrieval) {
      return Result.fail(`Subscription setting ${settingName.value} for user ${dto.userSubscriptionUuid} is sensitive!`)
    }

    if (dto.decryptWith) {
      const userUuidOrError = Uuid.create(dto.decryptWith.userUuid)
      if (userUuidOrError.isFailed()) {
        return Result.fail(userUuidOrError.getError())
      }
      const userUuid = userUuidOrError.getValue()

      const decryptedValue = await this.settingDecrypter.decryptSubscriptionSettingValue(
        subscriptionSetting,
        userUuid.value,
      )

      return Result.ok({
        setting: subscriptionSetting,
        decryptedValue,
      })
    }

    return Result.ok({
      setting: subscriptionSetting,
    })
  }
}

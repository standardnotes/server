import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { SubscriptionSetting } from '../../Setting/SubscriptionSetting'
import { SubscriptionSettingRepositoryInterface } from '../../Setting/SubscriptionSettingRepositoryInterface'
import { GetSubscriptionSettingsDTO } from './GetSubscriptionSettingsDTO'
import { SettingCrypterInterface } from '../../Setting/SettingCrypterInterface';

export class GetSubscriptionSettings
  implements UseCaseInterface<Array<{ setting: SubscriptionSetting; decryptedValue?: string | null }>>
{
  constructor(
    private subscriptionSettingRepository: SubscriptionSettingRepositoryInterface,
    private settingCrypter: SettingCrypterInterface,
  ) {}

  async execute(
    dto: GetSubscriptionSettingsDTO,
  ): Promise<Result<Array<{ setting: SubscriptionSetting; decryptedValue?: string | null }>>> {
    const userSubscriptionUuidOrError = Uuid.create(dto.userSubscriptionUuid)
    if (userSubscriptionUuidOrError.isFailed()) {
      return Result.fail(userSubscriptionUuidOrError.getError())
    }
    const userSubscriptionUuid = userSubscriptionUuidOrError.getValue()

    const subscriptionSettings =
      await this.subscriptionSettingRepository.findAllBySubscriptionUuid(userSubscriptionUuid)

    if (dto.decryptWith) {
      const userUuidOrError = Uuid.create(dto.decryptWith.userUuid)
      if (userUuidOrError.isFailed()) {
        return Result.fail(userUuidOrError.getError())
      }
      const userUuid = userUuidOrError.getValue()

      const result = []
      for (const subscriptionSetting of subscriptionSettings) {
        const decryptedValue = await this.settingCrypter.decryptSubscriptionSettingValue(
          subscriptionSetting,
          userUuid.value,
        )
        result.push({
          setting: subscriptionSetting,
          decryptedValue,
        })
      }

      return Result.ok(result)
    }

    return Result.ok(
      subscriptionSettings.map((subscriptionSetting) => ({
        setting: subscriptionSetting,
      })),
    )
  }
}

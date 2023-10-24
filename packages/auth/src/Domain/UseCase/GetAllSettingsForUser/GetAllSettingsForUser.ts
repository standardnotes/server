import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { GetAllSettingsForUserDTO } from './GetAllSettingsForUserDTO'
import { Setting } from '../../Setting/Setting'
import { SubscriptionSetting } from '../../Setting/SubscriptionSetting'
import { GetSubscriptionSettings } from '../GetSubscriptionSettings/GetSubscriptionSettings'
import { GetSettings } from '../GetSettings/GetSettings'
import { GetSharedOrRegularSubscriptionForUser } from '../GetSharedOrRegularSubscriptionForUser/GetSharedOrRegularSubscriptionForUser'

export class GetAllSettingsForUser
  implements
    UseCaseInterface<{
      settings: { setting: Setting; decryptedValue?: string | null }[]
      subscriptionSettings: { setting: SubscriptionSetting; decryptedValue?: string | null }[]
    }>
{
  constructor(
    private getSettings: GetSettings,
    private getSharedOrRegularSubscription: GetSharedOrRegularSubscriptionForUser,
    private getSubscriptionSettings: GetSubscriptionSettings,
  ) {}

  async execute(dto: GetAllSettingsForUserDTO): Promise<
    Result<{
      settings: { setting: Setting; decryptedValue?: string | null }[]
      subscriptionSettings: { setting: SubscriptionSetting; decryptedValue?: string | null }[]
    }>
  > {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const settingsOrError = await this.getSettings.execute({
      userUuid: userUuid.value,
      decrypted: true,
    })
    if (settingsOrError.isFailed()) {
      return Result.fail(settingsOrError.getError())
    }
    const settings = settingsOrError.getValue()

    const subscriptionOrError = await this.getSharedOrRegularSubscription.execute({
      userUuid: userUuid.value,
    })

    if (subscriptionOrError.isFailed()) {
      return Result.ok({
        settings,
        subscriptionSettings: [],
      })
    }

    const subscription = subscriptionOrError.getValue()
    const subscriptionSettingsOrError = await this.getSubscriptionSettings.execute({
      userSubscriptionUuid: subscription.uuid,
      decryptWith: {
        userUuid: userUuid.value,
      },
    })
    if (subscriptionSettingsOrError.isFailed()) {
      return Result.fail(subscriptionSettingsOrError.getError())
    }
    const subscriptionSettings = subscriptionSettingsOrError.getValue()

    return Result.ok({
      settings,
      subscriptionSettings,
    })
  }
}

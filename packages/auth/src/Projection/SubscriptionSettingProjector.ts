import { injectable } from 'inversify'

import { SimpleSubscriptionSetting } from '../Domain/Setting/SimpleSubscriptionSetting'
import { SubscriptionSetting } from '../Domain/Setting/SubscriptionSetting'

@injectable()
export class SubscriptionSettingProjector {
  async projectSimple(setting: SubscriptionSetting): Promise<SimpleSubscriptionSetting> {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      userSubscription,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      serverEncryptionVersion,
      ...rest
    } = setting

    return rest
  }
  async projectManySimple(settings: SubscriptionSetting[]): Promise<SimpleSubscriptionSetting[]> {
    return Promise.all(
      settings.map(async (setting) => {
        return this.projectSimple(setting)
      }),
    )
  }
}

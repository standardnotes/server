import { injectable } from 'inversify'

import { SimpleSubscriptionSetting } from '../Domain/Setting/SimpleSubscriptionSetting'
import { SubscriptionSetting } from '../Domain/Setting/SubscriptionSetting'

@injectable()
export class SubscriptionSettingProjector {
  async projectSimple(setting: SubscriptionSetting): Promise<SimpleSubscriptionSetting> {
    return {
      uuid: setting.uuid,
      name: setting.name,
      value: setting.value,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
      sensitive: setting.sensitive,
    }
  }

  async projectManySimple(settings: SubscriptionSetting[]): Promise<SimpleSubscriptionSetting[]> {
    return Promise.all(
      settings.map(async (setting) => {
        return this.projectSimple(setting)
      }),
    )
  }
}

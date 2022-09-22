import { injectable } from 'inversify'

import { Setting } from '../Domain/Setting/Setting'
import { SimpleSetting } from '../Domain/Setting/SimpleSetting'

@injectable()
export class SettingProjector {
  async projectSimple(setting: Setting): Promise<SimpleSetting> {
    return {
      uuid: setting.uuid,
      name: setting.name,
      value: setting.value,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
      sensitive: setting.sensitive,
    }
  }

  async projectManySimple(settings: Setting[]): Promise<SimpleSetting[]> {
    return Promise.all(
      settings.map(async (setting) => {
        return this.projectSimple(setting)
      }),
    )
  }
}

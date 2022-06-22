import { injectable } from 'inversify'

import { Setting } from '../Domain/Setting/Setting'
import { SimpleSetting } from '../Domain/Setting/SimpleSetting'

@injectable()
export class SettingProjector {
  async projectSimple(setting: Setting): Promise<SimpleSetting> {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      user,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      serverEncryptionVersion,
      ...rest
    } = setting

    return rest
  }
  async projectManySimple(settings: Setting[]): Promise<SimpleSetting[]> {
    return Promise.all(
      settings.map(async (setting) => {
        return this.projectSimple(setting)
      }),
    )
  }
}

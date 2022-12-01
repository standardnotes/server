import { SettingName, Uuid } from '@standardnotes/domain-core'

import { Setting } from './Setting'

export interface SettingRepositoryInterface {
  findOneByNameAndValue(name: SettingName, value: string): Promise<Setting | null>
  setValueOnMultipleSettings(settingNames: string[], userUuid: Uuid, value: string | null): Promise<void>
}

import { Uuid } from '@standardnotes/domain-core'

export interface SettingRepositoryInterface {
  setValueOnMultipleSettings(settingNames: string[], userUuid: Uuid, value: string | null): Promise<void>
}

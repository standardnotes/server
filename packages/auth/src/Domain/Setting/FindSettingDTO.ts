import { SettingName } from '@standardnotes/settings'

export type FindSettingDTO = {
  userUuid: string
  settingName: SettingName
  settingUuid?: string
}

import { Uuid } from '@standardnotes/common'

export type DeleteSettingDto = {
  settingName: string
  userUuid: Uuid
}

import { Uuid } from '@standardnotes/common'

export type FindSettingDTO = {
  userUuid: string
  settingName: string
  settingUuid?: Uuid
}

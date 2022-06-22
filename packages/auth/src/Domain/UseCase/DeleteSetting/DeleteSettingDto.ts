import { Uuid } from '@standardnotes/common'

export type DeleteSettingDto = {
  userUuid: Uuid
  settingName: string
  uuid?: string
  timestamp?: number
  softDelete?: boolean
}

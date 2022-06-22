import { Uuid } from '@standardnotes/common'

export type DeleteSettingResponse =
  | {
      success: true
      userUuid: Uuid
      settingName: string
    }
  | {
      success: false
      error: {
        message: string
      }
    }

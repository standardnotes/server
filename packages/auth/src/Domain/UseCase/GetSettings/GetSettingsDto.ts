import { Uuid } from '@standardnotes/common'

export type GetSettingsDto = {
  userUuid: Uuid
  settingName?: string
  allowSensitiveRetrieval?: boolean
  updatedAfter?: number
}

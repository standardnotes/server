import { Uuid } from '@standardnotes/common'

import { SimpleSetting } from '../../Setting/SimpleSetting'

export type GetSettingsResponse =
  | {
      success: true
      userUuid: Uuid
      settings: SimpleSetting[]
    }
  | {
      success: false
      error: {
        message: string
      }
    }

import { SimpleSetting } from '../../Setting/SimpleSetting'

export type GetSettingsResponse =
  | {
      success: true
      userUuid: string
      settings: SimpleSetting[]
    }
  | {
      success: false
      error: {
        message: string
      }
    }

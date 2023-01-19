import { SimpleSetting } from '../../Setting/SimpleSetting'

export type GetSettingResponse =
  | {
      success: true
      userUuid: string
      setting: SimpleSetting
    }
  | {
      success: true
      sensitive: true
    }
  | {
      success: false
      error: {
        message: string
      }
    }

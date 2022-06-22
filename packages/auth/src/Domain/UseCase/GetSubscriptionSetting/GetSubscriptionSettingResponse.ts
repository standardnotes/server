import { SimpleSetting } from '../../Setting/SimpleSetting'

export type GetSubscriptionSettingResponse =
  | {
      success: true
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

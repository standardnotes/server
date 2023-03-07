import { SimpleSetting } from '../../Setting/SimpleSetting'
import { SimpleSubscriptionSetting } from '../../Setting/SimpleSubscriptionSetting'

export type GetSettingsResponse =
  | {
      success: true
      userUuid: string
      settings: Array<SimpleSetting | SimpleSubscriptionSetting>
    }
  | {
      success: false
      error: {
        message: string
      }
    }

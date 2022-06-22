import { SimpleSetting } from '../../Setting/SimpleSetting'

export type UpdateSettingResponse =
  | {
      success: true
      setting: SimpleSetting
      statusCode: number
    }
  | {
      success: false
      error: {
        message: string
      }
      statusCode: number
    }

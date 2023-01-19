export type DeleteSettingResponse =
  | {
      success: true
      userUuid: string
      settingName: string
    }
  | {
      success: false
      error: {
        message: string
      }
    }

export type DeleteSettingDto = {
  userUuid: string
  settingName: string
  uuid?: string
  timestamp?: number
  softDelete?: boolean
  serverPassword?: string
  authTokenVersion?: number
  shouldVerifyUserServerPassword?: boolean
}

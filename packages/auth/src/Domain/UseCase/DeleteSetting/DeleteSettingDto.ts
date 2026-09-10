export type DeleteSettingDto = {
  userUuid: string
  settingName: string
  uuid?: string
  timestamp?: number
  softDelete?: boolean
  serverPassword?: string
  shouldVerifyUserServerPassword?: boolean
  checkUserPermissions?: boolean
}

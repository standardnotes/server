export interface SetSettingValueDTO {
  settingName: string
  userUuid: string
  value: string | null
  checkUserPermissions?: boolean
}

export interface SetSubscriptionSettingValueDTO {
  settingName: string
  userSubscriptionUuid: string
  value: string | null
  newUserSubscriptionUuid?: string
  checkUserPermissions?: boolean
}

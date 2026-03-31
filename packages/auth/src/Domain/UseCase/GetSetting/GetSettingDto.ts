export type GetSettingDto = {
  userUuid: string
  settingName: string
  allowSensitiveRetrieval: boolean
  decrypted: boolean
  serverPassword?: string
  shouldVerifyUserServerPassword?: boolean
  authTokenVersion?: number
}

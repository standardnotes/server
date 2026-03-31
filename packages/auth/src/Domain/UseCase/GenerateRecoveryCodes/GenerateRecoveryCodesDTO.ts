export interface GenerateRecoveryCodesDTO {
  userUuid: string
  serverPassword?: string
  authTokenVersion?: number
  shouldVerifyUserServerPassword?: boolean
}

export interface GenerateRecoveryCodesDTO {
  userUuid: string
  serverPassword?: string
  shouldVerifyUserServerPassword?: boolean
}

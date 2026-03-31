export type DeleteAccountDTO = {
  userUuid?: string
  username?: string
  serverPassword?: string
  shouldVerifyUserServerPassword?: boolean
  authTokenVersion?: number
}

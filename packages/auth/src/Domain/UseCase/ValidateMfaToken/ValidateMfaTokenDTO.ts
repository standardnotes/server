export interface ValidateMfaTokenDTO {
  userUuid: string
  totpToken: string | undefined
}

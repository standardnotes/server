export interface PKCERepositoryInterface {
  storeCodeChallenge(codeChallenge: string, userUuid: string): Promise<void>
  removeCodeChallenge(codeChallenge: string, userUuid: string): Promise<boolean>
}

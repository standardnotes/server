export interface PKCERepositoryInterface {
  storeCodeChallenge(codeChallenge: string): Promise<void>
  removeCodeChallenge(codeChallenge: string): Promise<boolean>
}

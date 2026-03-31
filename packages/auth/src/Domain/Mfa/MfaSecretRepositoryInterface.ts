export interface MfaSecretRepositoryInterface {
  getMfaSecret(userUuid: string): Promise<string | null>
  setMfaSecret(userUuid: string, secret: string, ttlInSeconds?: number): Promise<void>
  deleteMfaSecret(userUuid: string): Promise<void>
}

export interface RemoveFileDTO {
  userInput?: {
    userUuid: string
    resourceRemoteIdentifier: string
    regularSubscriptionUuid: string
  }
  vaultInput?: {
    sharedVaultUuid: string
    vaultOwnerUuid: string
    resourceRemoteIdentifier: string
  }
}

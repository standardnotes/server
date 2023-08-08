export interface AddUserToSharedVaultDTO {
  sharedVaultUuid: string
  userUuid: string
  permission: string
  skipSharedVaultExistenceCheck?: boolean
}

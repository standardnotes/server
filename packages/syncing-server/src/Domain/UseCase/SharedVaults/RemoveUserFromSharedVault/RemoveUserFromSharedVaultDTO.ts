export interface RemoveUserFromSharedVaultDTO {
  sharedVaultUuid: string
  originatorUuid: string
  userUuid: string
  forceRemoveOwner?: boolean
}

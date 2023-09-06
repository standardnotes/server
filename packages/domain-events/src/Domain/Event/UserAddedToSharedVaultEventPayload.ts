export interface UserAddedToSharedVaultEventPayload {
  sharedVaultUuid: string
  userUuid: string
  permission: string
  createdAt: number
  updatedAt: number
}

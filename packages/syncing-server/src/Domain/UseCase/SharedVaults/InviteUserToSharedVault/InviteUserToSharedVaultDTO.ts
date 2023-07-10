export interface InviteUserToSharedVaultDTO {
  sharedVaultUuid: string
  senderUuid: string
  recipientUuid: string
  encryptedMessage: string
  permission: string
}

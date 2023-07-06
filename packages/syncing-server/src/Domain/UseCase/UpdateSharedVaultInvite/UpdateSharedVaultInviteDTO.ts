export interface UpdateSharedVaultInviteDTO {
  encryptedMessage: string
  inviteUuid: string
  senderUuid: string
  permission?: string
}

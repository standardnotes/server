export interface SendMessageToUserDTO {
  recipientUuid: string
  senderUuid: string
  encryptedMessage: string
  replaceabilityIdentifier?: string
}

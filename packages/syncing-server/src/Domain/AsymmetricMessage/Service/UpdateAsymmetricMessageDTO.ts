export type UpdateAsymmetricMessageDTO = {
  messageUuid: string
  senderUuid: string
  encryptedMessage: string
  replaceabilityIdentifier?: string
}

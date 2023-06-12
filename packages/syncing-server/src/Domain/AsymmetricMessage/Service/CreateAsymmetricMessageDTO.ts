export type CreateAsymmetricMessageDTO = {
  userUuid: string
  senderUuid: string
  encryptedMessage: string
  replaceabilityIdentifier?: string
}

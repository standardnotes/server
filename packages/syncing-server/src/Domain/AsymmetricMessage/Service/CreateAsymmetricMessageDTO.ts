export type CreateAsymmetricMessageDTO = {
  userUuid: string
  senderUuid: string
  senderPublicKey: string
  encryptedMessage: string
}

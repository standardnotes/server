import { Timestamps, Uuid } from '@standardnotes/domain-core'

export interface MessageProps {
  recipientUuid: Uuid
  senderUuid: Uuid
  encryptedMessage: string
  replaceabilityIdentifier: string | null
  timestamps: Timestamps
}

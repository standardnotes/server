export interface MessageSentToUserEventPayload {
  message: {
    uuid: string
    recipient_uuid: string
    sender_uuid: string
    encrypted_message: string
    replaceability_identifier: string | null
    created_at_timestamp: number
    updated_at_timestamp: number
  }
}

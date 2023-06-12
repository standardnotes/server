export type AsymmetricMessageHash = {
  uuid: string
  user_uuid: string
  sender_uuid: string
  encrypted_message: string
  replaceability_identifier?: string
  created_at_timestamp?: number
  updated_at_timestamp?: number
}

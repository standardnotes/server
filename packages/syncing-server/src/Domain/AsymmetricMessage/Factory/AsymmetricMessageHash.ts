export type AsymmetricMessageHash = {
  uuid: string
  user_uuid: string
  sender_uuid: string
  sender_public_key: string
  encrypted_message: string
  created_at_timestamp?: number
  updated_at_timestamp?: number
}

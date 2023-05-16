export type GroupUserKeyHash = {
  uuid: string
  user_uuid: string
  group_uuid: string
  created_at_timestamp?: number
  updated_at_timestamp?: number
  sender_public_key: string
  encrypted_group_key: string
}

export type GroupUserKeyProjection = {
  uuid: string
  group_uuid: string
  user_uuid: string
  sender_uuid: string
  sender_public_key: string
  recipient_public_key: string
  encrypted_group_key: string
  permissions: string
  created_at_timestamp: number
  updated_at_timestamp: number
}

export type GroupUserListingProjection = {
  uuid: string
  group_uuid: string
  user_uuid: string
  permissions?: string
  created_at_timestamp: number
  updated_at_timestamp: number
}

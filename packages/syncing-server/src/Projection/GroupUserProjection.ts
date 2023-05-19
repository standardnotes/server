export type GroupUserProjection = {
  uuid: string
  group_uuid: string
  user_uuid: string
  inviter_uuid: string
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

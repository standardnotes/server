export type GroupInviteHash = {
  uuid: string
  user_uuid: string
  group_uuid: string
  inviter_uuid: string
  permissions: string
  created_at_timestamp?: number
  updated_at_timestamp?: number
}

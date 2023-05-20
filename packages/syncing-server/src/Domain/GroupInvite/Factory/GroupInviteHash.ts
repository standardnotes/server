import { GroupInviteType } from '../Model/GroupInviteType'

export type GroupInviteHash = {
  uuid: string
  user_uuid: string
  group_uuid: string
  inviter_uuid: string
  inviter_public_key: string
  encrypted_group_key: string
  invite_type: GroupInviteType
  permissions: string
  created_at_timestamp?: number
  updated_at_timestamp?: number
}

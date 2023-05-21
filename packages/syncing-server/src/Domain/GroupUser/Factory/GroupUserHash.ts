import { GroupUserPermission } from '../Model/GroupUserPermission'

export type GroupUserHash = {
  uuid: string
  user_uuid: string
  group_uuid: string
  permissions: GroupUserPermission
  created_at_timestamp?: number
  updated_at_timestamp?: number
}

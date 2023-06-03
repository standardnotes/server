import { SharedVaultUserPermission } from '../Model/SharedVaultUserPermission'

export type SharedVaultUserHash = {
  uuid: string
  user_uuid: string
  shared_vault_uuid: string
  permissions: SharedVaultUserPermission
  created_at_timestamp?: number
  updated_at_timestamp?: number
}

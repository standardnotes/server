import { VaultUserPermission } from '../Model/VaultUserPermission'

export type VaultUserHash = {
  uuid: string
  user_uuid: string
  vault_uuid: string
  permissions: VaultUserPermission
  created_at_timestamp?: number
  updated_at_timestamp?: number
}

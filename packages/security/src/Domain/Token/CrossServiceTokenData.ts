import { Role } from '../Role/Role'

export type CrossServiceTokenData = {
  user: {
    uuid: string
    email: string
  }
  belongs_to_shared_vaults?: Array<{
    shared_vault_uuid: string
    permission: string
  }>
  shared_vault_owner_context?: {
    upload_bytes_limit: number
  }
  roles: Array<Role>
  session?: {
    uuid: string
    api_version: string
    created_at: string
    updated_at: string
    device_info: string
    readonly_access: boolean
    access_expiration: string
    refresh_expiration: string
  }
  extensionKey?: string
  hasContentLimit?: boolean
}

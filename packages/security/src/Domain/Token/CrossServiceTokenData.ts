import { Role } from '../Role/Role'

export type CrossServiceTokenData = {
  user: {
    uuid: string
    email: string
  }
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
}

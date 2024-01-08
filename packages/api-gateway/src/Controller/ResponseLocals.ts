import { Role } from '@standardnotes/security'

export interface ResponseLocals {
  authToken: string
  user: {
    uuid: string
    email: string
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
  readOnlyAccess: boolean
  isFreeUser: boolean
  belongsToSharedVaults?: Array<{
    shared_vault_uuid: string
    permission: string
  }>
  sharedVaultOwnerContext?: {
    upload_bytes_limit: number
  }
}

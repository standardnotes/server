import { Role } from '@standardnotes/security'

export interface ResponseLocals {
  user: {
    uuid: string
    email: string
  }
  roles: Array<Role>
  isFreeUser: boolean
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
  sharedVaultOwnerContext?: {
    upload_bytes_limit: number
  }
}

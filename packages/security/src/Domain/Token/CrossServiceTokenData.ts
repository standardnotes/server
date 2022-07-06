import { Uuid } from '@standardnotes/common'

import { Role } from '../Role/Role'

export type CrossServiceTokenData = {
  user: {
    uuid: Uuid
    email: string
  }
  roles: Array<Role>
  session?: {
    uuid: Uuid
    api_version: string
    created_at: string
    updated_at: string
    device_info: string
    readonly_access: boolean
    access_expiration: string
    refresh_expiration: string
  }
  extensionKey?: string
  analyticsId?: number
}

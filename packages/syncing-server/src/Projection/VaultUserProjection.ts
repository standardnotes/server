export type VaultUserProjection = {
  uuid: string
  vault_uuid: string
  user_uuid: string
  permissions: string
  created_at_timestamp: number
  updated_at_timestamp: number
}

export type VaultUserListingProjection = {
  uuid: string
  vault_uuid: string
  user_uuid: string
  permissions?: string
  created_at_timestamp: number
  updated_at_timestamp: number
}

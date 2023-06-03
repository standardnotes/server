export type SharedVaultUserProjection = {
  uuid: string
  shared_vault_uuid: string
  user_uuid: string
  permissions: string
  created_at_timestamp: number
  updated_at_timestamp: number
}

export type SharedVaultUserListingProjection = {
  uuid: string
  shared_vault_uuid: string
  user_uuid: string
  permissions?: string
  created_at_timestamp: number
  updated_at_timestamp: number
}

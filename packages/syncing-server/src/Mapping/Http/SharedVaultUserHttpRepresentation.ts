export interface SharedVaultUserHttpRepresentation {
  uuid: string
  shared_vault_uuid: string
  user_uuid: string
  permission: string
  is_designated_survivor: boolean
  created_at_timestamp: number
  updated_at_timestamp: number
}

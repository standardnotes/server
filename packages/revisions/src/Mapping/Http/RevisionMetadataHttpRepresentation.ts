export interface RevisionMetadataHttpRepresentation {
  uuid: string
  item_uuid: string
  content_type: string
  created_at: string
  updated_at: string
  required_role: string
  shared_vault_uuid: string | null
}

export interface SavedItemHttpRepresentation {
  uuid: string
  duplicate_of: string | null
  content_type: string
  auth_hash: string | null
  deleted: boolean
  created_at: string
  created_at_timestamp: number
  updated_at: string
  updated_at_timestamp: number
}

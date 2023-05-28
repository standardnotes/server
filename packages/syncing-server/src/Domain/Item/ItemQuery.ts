export type ItemQuery = {
  userUuid?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  uuids?: Array<string>
  lastSyncTime?: number
  syncTimeComparison?: '>' | '>='
  contentType?: string | string[]
  includeVaultUuids?: string[]
  exclusiveVaultUuids?: string[] | null
  deleted?: boolean
  offset?: number
  limit?: number
  createdBetween?: Date[]
  selectString?: string
}

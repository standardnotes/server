export type ItemQuery = {
  userUuid?: string
  sortBy: string
  sortOrder: 'ASC' | 'DESC'
  uuids?: Array<string>
  lastSyncTime?: number
  syncTimeComparison?: '>' | '>='
  contentType?: string
  deleted?: boolean
  offset?: number
  limit?: number
}

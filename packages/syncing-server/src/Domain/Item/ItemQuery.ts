export type ItemQuery = {
  userUuid?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  uuids?: Array<string>
  lastSyncTime?: number
  syncTimeComparison?: '>' | '>='
  contentType?: string | string[]
  includeGroupUuids?: string[]
  exclusiveGroupUuid?: string | null
  deleted?: boolean
  offset?: number
  limit?: number
  createdBetween?: Date[]
  selectString?: string
}

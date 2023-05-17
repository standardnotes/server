export type GetItemsDTO = {
  userUuid: string
  syncToken?: string | null
  cursorToken?: string | null
  limit?: number
  contentType?: string
  groupUuids?: string[] | null
}

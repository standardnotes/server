import { ItemHash } from '../../../Item/ItemHash'

export type SyncItemsDTO = {
  userUuid: string
  itemHashes: Array<ItemHash>
  computeIntegrityHash: boolean
  limit: number
  sharedVaultUuids?: string[] | null
  syncToken?: string | null
  cursorToken?: string | null
  contentType?: string
  apiVersion: string
  snjsVersion: string
  readOnlyAccess: boolean
  sessionUuid: string | null
}

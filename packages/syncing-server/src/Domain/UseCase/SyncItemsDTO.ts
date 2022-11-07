import { Uuid } from '@standardnotes/common'
import { ItemHash } from '../Item/ItemHash'

export type SyncItemsDTO = {
  userUuid: string
  itemHashes: Array<ItemHash>
  computeIntegrityHash: boolean
  limit: number
  syncToken?: string | null
  cursorToken?: string | null
  contentType?: string
  apiVersion: string
  readOnlyAccess: boolean
  sessionUuid: Uuid | null
}

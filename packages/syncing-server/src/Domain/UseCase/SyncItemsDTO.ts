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
  analyticsId?: number
  apiVersion: string
  readOnlyAccess: boolean
  sessionUuid: Uuid | null
}

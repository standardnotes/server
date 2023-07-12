import { ConflictType } from '@standardnotes/responses'

import { ItemHash } from '../ItemHash'
import { ItemHttpRepresentation } from '../../../Mapping/Http/ItemHttpRepresentation'

export type SyncResponse20161215 = {
  retrieved_items: Array<ItemHttpRepresentation>
  saved_items: Array<ItemHttpRepresentation>
  unsaved: Array<{
    item: ItemHttpRepresentation | ItemHash
    error: {
      tag: ConflictType
    }
  }>
  sync_token: string
  cursor_token?: string
}

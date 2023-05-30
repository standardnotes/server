import { ItemHash } from '../ItemHash'
import { ItemProjection } from '../../../Projection/ItemProjection'
import { ConflictType } from '../../../Tmp/ConflictType'

export type SyncResponse20161215 = {
  retrieved_items: Array<ItemProjection>
  saved_items: Array<ItemProjection>
  unsaved: Array<{
    item: ItemProjection | ItemHash
    error: {
      tag: ConflictType
    }
  }>
  sync_token: string
  cursor_token?: string
}

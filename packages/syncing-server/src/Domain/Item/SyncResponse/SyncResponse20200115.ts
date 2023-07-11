import { ItemConflictHttpRepresentation } from '../../../Mapping/Http/ItemConflictHttpRepresentation'
import { ItemHttpRepresentation } from '../../../Mapping/Http/ItemHttpRepresentation'
import { SavedItemHttpRepresentation } from '../../../Mapping/Http/SavedItemHttpRepresentation'

export type SyncResponse20200115 = {
  retrieved_items: Array<ItemHttpRepresentation>
  saved_items: Array<SavedItemHttpRepresentation>
  conflicts: Array<ItemConflictHttpRepresentation>
  sync_token: string
  cursor_token?: string
}

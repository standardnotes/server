import { MapperInterface } from '@standardnotes/domain-core'

import { Item } from '../Item'
import { ItemConflict } from '../ItemConflict'
import { SyncResponse20200115 } from './SyncResponse20200115'
import { SyncResponseFactoryInterface } from './SyncResponseFactoryInterface'
import { SyncItemsResponse } from '../../UseCase/Syncing/SyncItems/SyncItemsResponse'
import { ItemHttpRepresentation } from '../../../Mapping/Http/ItemHttpRepresentation'
import { ItemConflictHttpRepresentation } from '../../../Mapping/Http/ItemConflictHttpRepresentation'
import { SavedItemHttpRepresentation } from '../../../Mapping/Http/SavedItemHttpRepresentation'

export class SyncResponseFactory20200115 implements SyncResponseFactoryInterface {
  constructor(
    private httpMapper: MapperInterface<Item, ItemHttpRepresentation>,
    private itemConflictMapper: MapperInterface<ItemConflict, ItemConflictHttpRepresentation>,
    private savedItemMapper: MapperInterface<Item, SavedItemHttpRepresentation>,
  ) {}

  async createResponse(syncItemsResponse: SyncItemsResponse): Promise<SyncResponse20200115> {
    const retrievedItems = []
    for (const item of syncItemsResponse.retrievedItems) {
      retrievedItems.push(this.httpMapper.toProjection(item))
    }

    const savedItems = []
    for (const item of syncItemsResponse.savedItems) {
      savedItems.push(this.savedItemMapper.toProjection(item))
    }

    const conflicts = []
    for (const itemConflict of syncItemsResponse.conflicts) {
      conflicts.push(this.itemConflictMapper.toProjection(itemConflict))
    }

    return {
      retrieved_items: retrievedItems,
      saved_items: savedItems,
      conflicts,
      sync_token: syncItemsResponse.syncToken,
      cursor_token: syncItemsResponse.cursorToken,
    }
  }
}

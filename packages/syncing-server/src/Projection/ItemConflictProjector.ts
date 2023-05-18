import { ProjectorInterface } from './ProjectorInterface'

import { Item } from '../Domain/Item/Item'
import { ItemConflict } from '../Domain/Item/ItemConflict'
import { ItemConflictProjection } from './ItemConflictProjection'
import { ItemProjection } from './ItemProjection'

export class ItemConflictProjector implements ProjectorInterface<ItemConflict, ItemConflictProjection> {
  constructor(private itemProjector: ProjectorInterface<Item, ItemProjection>) {}

  projectSimple(_itemConflict: ItemConflict): ItemConflictProjection {
    throw Error('not implemented')
  }

  projectCustom(_projectionType: string, _itemConflict: ItemConflict): ItemConflictProjection {
    throw Error('not implemented')
  }

  projectFull(itemConflict: ItemConflict): ItemConflictProjection {
    const projection: ItemConflictProjection = {
      unsaved_item: itemConflict.unsavedItem,
      type: itemConflict.type,
    }

    if (itemConflict.serverItem) {
      projection.server_item = <ItemProjection>this.itemProjector.projectFull(itemConflict.serverItem)
    }

    return projection
  }
}

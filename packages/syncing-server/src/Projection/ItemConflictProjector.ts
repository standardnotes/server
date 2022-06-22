import { inject, injectable } from 'inversify'
import TYPES from '../Bootstrap/Types'
import { ProjectorInterface } from './ProjectorInterface'

import { Item } from '../Domain/Item/Item'
import { ItemConflict } from '../Domain/Item/ItemConflict'
import { ItemConflictProjection } from './ItemConflictProjection'
import { ItemProjection } from './ItemProjection'

@injectable()
export class ItemConflictProjector implements ProjectorInterface<ItemConflict, ItemConflictProjection> {
  constructor(@inject(TYPES.ItemProjector) private itemProjector: ProjectorInterface<Item, ItemProjection>) {}

  async projectSimple(_itemConflict: ItemConflict): Promise<ItemConflictProjection> {
    throw Error('not implemented')
  }

  async projectCustom(_projectionType: string, _itemConflict: ItemConflict): Promise<ItemConflictProjection> {
    throw Error('not implemented')
  }

  async projectFull(itemConflict: ItemConflict): Promise<ItemConflictProjection> {
    const projection: ItemConflictProjection = {
      unsaved_item: itemConflict.unsavedItem,
      type: itemConflict.type,
    }

    if (itemConflict.serverItem) {
      projection.server_item = <ItemProjection>await this.itemProjector.projectFull(itemConflict.serverItem)
    }

    return projection
  }
}

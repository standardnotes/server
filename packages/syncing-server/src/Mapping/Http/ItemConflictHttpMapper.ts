import { MapperInterface } from '@standardnotes/domain-core'

import { Item } from '../../Domain/Item/Item'
import { ItemConflictHttpRepresentation } from './ItemConflictHttpRepresentation'
import { ItemConflict } from '../../Domain/Item/ItemConflict'
import { ItemHttpRepresentation } from './ItemHttpRepresentation'

export class ItemConflictHttpMapper implements MapperInterface<ItemConflict, ItemConflictHttpRepresentation> {
  constructor(private mapper: MapperInterface<Item, ItemHttpRepresentation>) {}

  toDomain(_projection: ItemConflictHttpRepresentation): ItemConflict {
    throw new Error('Mapping from http representation to domain is not implemented.')
  }

  toProjection(domain: ItemConflict): ItemConflictHttpRepresentation {
    const representation: ItemConflictHttpRepresentation = {
      unsaved_item: domain.unsavedItem,
      type: domain.type,
    }

    if (domain.serverItem) {
      representation.server_item = this.mapper.toProjection(domain.serverItem)
    }

    return representation
  }
}

import { MapperInterface } from '@standardnotes/domain-core'

import { Item } from '../../Domain/Item/Item'
import { ItemConflictHttpRepresentation } from './ItemConflictHttpRepresentation'
import { ItemConflict } from '../../Domain/Item/ItemConflict'
import { ItemHttpRepresentation } from './ItemHttpRepresentation'
import { ItemHash } from '../../Domain/Item/ItemHash'
import { ItemHashHttpRepresentation } from './ItemHashHttpRepresentation'

export class ItemConflictHttpMapper implements MapperInterface<ItemConflict, ItemConflictHttpRepresentation> {
  constructor(
    private mapper: MapperInterface<Item, ItemHttpRepresentation>,
    private itemHashMapper: MapperInterface<ItemHash, ItemHashHttpRepresentation>,
  ) {}

  toDomain(_projection: ItemConflictHttpRepresentation): ItemConflict {
    throw new Error('Mapping from http representation to domain is not implemented.')
  }

  toProjection(domain: ItemConflict): ItemConflictHttpRepresentation {
    const representation: ItemConflictHttpRepresentation = {
      type: domain.type,
    }

    if (domain.unsavedItem) {
      representation.unsaved_item = this.itemHashMapper.toProjection(domain.unsavedItem)
    }

    if (domain.serverItem) {
      representation.server_item = this.mapper.toProjection(domain.serverItem)
    }

    return representation
  }
}

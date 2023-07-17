import { MapperInterface } from '@standardnotes/domain-core'

import { ItemHashHttpRepresentation } from './ItemHashHttpRepresentation'
import { ItemHash } from '../../Domain/Item/ItemHash'

export class ItemHashHttpMapper implements MapperInterface<ItemHash, ItemHashHttpRepresentation> {
  toDomain(_projection: ItemHashHttpRepresentation): ItemHash {
    throw new Error('Mapping from http representation to domain is not implemented.')
  }

  toProjection(domain: ItemHash): ItemHashHttpRepresentation {
    return {
      ...domain.props,
    }
  }
}

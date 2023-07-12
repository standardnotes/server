import { ConflictType } from '@standardnotes/responses'

import { ItemHash } from '../../Domain/Item/ItemHash'
import { ItemHttpRepresentation } from './ItemHttpRepresentation'

export interface ItemConflictHttpRepresentation {
  server_item?: ItemHttpRepresentation
  unsaved_item?: ItemHash
  type: ConflictType
}

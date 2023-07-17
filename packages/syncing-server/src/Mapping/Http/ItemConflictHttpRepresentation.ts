import { ConflictType } from '@standardnotes/responses'

import { ItemHttpRepresentation } from './ItemHttpRepresentation'
import { ItemHashHttpRepresentation } from './ItemHashHttpRepresentation'

export interface ItemConflictHttpRepresentation {
  server_item?: ItemHttpRepresentation
  unsaved_item?: ItemHashHttpRepresentation
  type: ConflictType
}

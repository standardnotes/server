import { ConflictType } from '@standardnotes/responses'

import { ItemHash } from '../Domain/Item/ItemHash'
import { ItemProjection } from './ItemProjection'

export type ItemConflictProjection = {
  server_item?: ItemProjection
  unsaved_item?: ItemHash
  type: ConflictType
}

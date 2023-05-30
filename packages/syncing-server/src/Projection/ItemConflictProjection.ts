import { ItemHash } from '../Domain/Item/ItemHash'
import { ConflictType } from '../Tmp/ConflictType'
import { ItemProjection } from './ItemProjection'

export type ItemConflictProjection = {
  server_item?: ItemProjection
  unsaved_item?: ItemHash
  type: ConflictType
}

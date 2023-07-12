import { ItemHash } from '../../../Item/ItemHash'

export interface SaveNewItemDTO {
  userUuid: string
  itemHash: ItemHash
  sessionUuid: string | null
}

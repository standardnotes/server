import { ItemHash } from '../../../Item/ItemHash'

export interface SaveNewItemDTO {
  userUuid: string
  roleNames: string[]
  itemHash: ItemHash
  sessionUuid: string | null
  onGoingRevisionsTransition: boolean
}

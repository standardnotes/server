import { ItemHash } from '../../../Item/ItemHash'

export interface CheckForContentLimitDTO {
  userUuid: string
  itemsBeingModified: ItemHash[]
}

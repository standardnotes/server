import { ItemHash } from '../../../Item/ItemHash'

export interface SaveItemsDTO {
  itemHashes: ItemHash[]
  userUuid: string
  apiVersion: string
  readOnlyAccess: boolean
  sessionUuid: string | null
  snjsVersion: string
  roleNames: string[]
  onGoingRevisionsTransition: boolean
}

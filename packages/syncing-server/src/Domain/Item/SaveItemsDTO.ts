import { ItemHash } from './ItemHash'

export type SaveItemsDTO = {
  itemHashes: ItemHash[]
  userUuid: string
  apiVersion: string
  readOnlyAccess: boolean
  sessionUuid: string | null
}

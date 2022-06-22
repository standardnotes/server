import { GetItemsDTO } from './GetItemsDTO'
import { GetItemsResult } from './GetItemsResult'
import { Item } from './Item'
import { SaveItemsDTO } from './SaveItemsDTO'
import { SaveItemsResult } from './SaveItemsResult'

export interface ItemServiceInterface {
  getItems(dto: GetItemsDTO): Promise<GetItemsResult>
  saveItems(dto: SaveItemsDTO): Promise<SaveItemsResult>
  frontLoadKeysItemsToTop(userUuid: string, retrievedItems: Array<Item>): Promise<Array<Item>>
}

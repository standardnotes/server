import { ItemQuery } from './ItemQuery'

export interface ItemTransferCalculatorInterface {
  computeItemUuidsToFetch(itemQuery: ItemQuery, bytesTransferLimit: number): Promise<Array<string>>
  computeItemUuidBundlesToFetch(itemQuery: ItemQuery, bytesTransferLimit: number): Promise<Array<Array<string>>>
}

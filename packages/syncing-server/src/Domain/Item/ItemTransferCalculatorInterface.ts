import { Uuid } from '@standardnotes/common'

import { ItemQuery } from './ItemQuery'

export interface ItemTransferCalculatorInterface {
  computeItemUuidsToFetch(itemQuery: ItemQuery, bytesTransferLimit: number): Promise<Array<Uuid>>
  computeItemUuidBundlesToFetch(itemQuery: ItemQuery, bytesTransferLimit: number): Promise<Array<Array<Uuid>>>
}

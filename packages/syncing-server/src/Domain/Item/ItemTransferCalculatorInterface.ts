import { Uuid } from '@standardnotes/domain-core'

import { ItemContentSizeDescriptor } from './ItemContentSizeDescriptor'

export interface ItemTransferCalculatorInterface {
  computeItemUuidsToFetch(
    itemContentSizeDescriptors: ItemContentSizeDescriptor[],
    bytesTransferLimit: number,
    userUuid: Uuid,
  ): Promise<{ uuids: Array<string>; transferLimitBreachedBeforeEndOfItems: boolean }>
  computeItemUuidBundlesToFetch(
    itemContentSizeDescriptors: ItemContentSizeDescriptor[],
    bytesTransferLimit: number,
    userUuid: Uuid,
  ): Promise<Array<Array<string>>>
}

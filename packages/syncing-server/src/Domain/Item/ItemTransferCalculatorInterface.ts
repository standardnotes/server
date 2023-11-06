import { ItemContentSizeDescriptor } from './ItemContentSizeDescriptor'

export interface ItemTransferCalculatorInterface {
  computeItemUuidsToFetch(
    itemContentSizeDescriptors: ItemContentSizeDescriptor[],
    bytesTransferLimit: number,
  ): Promise<{ uuids: Array<string>; transferLimitBreachedBeforeEndOfItems: boolean }>
  computeItemUuidBundlesToFetch(
    itemContentSizeDescriptors: ItemContentSizeDescriptor[],
    bytesTransferLimit: number,
  ): Promise<Array<Array<string>>>
}

import { ItemContentSizeDescriptor } from './ItemContentSizeDescriptor'

export interface ItemTransferCalculatorInterface {
  computeItemUuidsToFetch(
    itemContentSizeDescriptors: ItemContentSizeDescriptor[],
    bytesTransferLimit: number,
  ): Promise<Array<string>>
  computeItemUuidBundlesToFetch(
    itemContentSizeDescriptors: ItemContentSizeDescriptor[],
    bytesTransferLimit: number,
  ): Promise<Array<Array<string>>>
}

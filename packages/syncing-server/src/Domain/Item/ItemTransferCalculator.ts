import { Logger } from 'winston'

import { ItemTransferCalculatorInterface } from './ItemTransferCalculatorInterface'
import { ItemContentSizeDescriptor } from './ItemContentSizeDescriptor'

export class ItemTransferCalculator implements ItemTransferCalculatorInterface {
  constructor(private logger: Logger) {}

  async computeItemUuidsToFetch(
    itemContentSizeDescriptors: ItemContentSizeDescriptor[],
    bytesTransferLimit: number,
  ): Promise<Array<string>> {
    const itemUuidsToFetch = []
    let totalContentSizeInBytes = 0
    for (const itemContentSize of itemContentSizeDescriptors) {
      const contentSize = itemContentSize.props.contentSize ?? 0

      itemUuidsToFetch.push(itemContentSize.props.uuid.value)
      totalContentSizeInBytes += contentSize

      const transferLimitBreached = this.isTransferLimitBreached({
        totalContentSizeInBytes,
        bytesTransferLimit,
        itemUuidsToFetch,
        itemContentSizeDescriptors,
      })

      if (transferLimitBreached) {
        break
      }
    }

    return itemUuidsToFetch
  }

  async computeItemUuidBundlesToFetch(
    itemContentSizeDescriptors: ItemContentSizeDescriptor[],
    bytesTransferLimit: number,
  ): Promise<Array<Array<string>>> {
    let itemUuidsToFetch = []
    let totalContentSizeInBytes = 0
    const bundles = []
    for (const itemContentSize of itemContentSizeDescriptors) {
      const contentSize = itemContentSize.props.contentSize ?? 0

      itemUuidsToFetch.push(itemContentSize.props.uuid.value)
      totalContentSizeInBytes += contentSize

      const transferLimitBreached = this.isTransferLimitBreached({
        totalContentSizeInBytes,
        bytesTransferLimit,
        itemUuidsToFetch,
        itemContentSizeDescriptors,
      })

      if (transferLimitBreached) {
        bundles.push(Object.assign([], itemUuidsToFetch))
        totalContentSizeInBytes = 0
        itemUuidsToFetch = []
      }
    }

    if (itemUuidsToFetch.length > 0) {
      bundles.push(itemUuidsToFetch)
    }

    return bundles
  }

  private isTransferLimitBreached(dto: {
    totalContentSizeInBytes: number
    bytesTransferLimit: number
    itemUuidsToFetch: Array<string>
    itemContentSizeDescriptors: ItemContentSizeDescriptor[]
  }): boolean {
    const transferLimitBreached = dto.totalContentSizeInBytes >= dto.bytesTransferLimit
    const transferLimitBreachedAtFirstItem =
      transferLimitBreached && dto.itemUuidsToFetch.length === 1 && dto.itemContentSizeDescriptors.length > 1

    if (transferLimitBreachedAtFirstItem) {
      this.logger.warn(
        `Item ${dto.itemUuidsToFetch[0]} is breaching the content size transfer limit: ${dto.bytesTransferLimit}`,
      )
    }

    return transferLimitBreached && !transferLimitBreachedAtFirstItem
  }
}

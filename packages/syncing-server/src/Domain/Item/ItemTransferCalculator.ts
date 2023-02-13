import { Logger } from 'winston'

import { ItemTransferCalculatorInterface } from './ItemTransferCalculatorInterface'
import { ItemQuery } from './ItemQuery'
import { ItemRepositoryInterface } from './ItemRepositoryInterface'

export class ItemTransferCalculator implements ItemTransferCalculatorInterface {
  constructor(private itemRepository: ItemRepositoryInterface, private logger: Logger) {}

  async computeItemUuidsToFetch(itemQuery: ItemQuery, bytesTransferLimit: number): Promise<Array<string>> {
    const itemUuidsToFetch = []
    const itemContentSizes = await this.itemRepository.findContentSizeForComputingTransferLimit(itemQuery)
    let totalContentSizeInBytes = 0
    for (const itemContentSize of itemContentSizes) {
      const contentSize = itemContentSize.contentSize ?? 0

      itemUuidsToFetch.push(itemContentSize.uuid)
      totalContentSizeInBytes += contentSize

      const transferLimitBreached = this.isTransferLimitBreached({
        totalContentSizeInBytes,
        bytesTransferLimit,
        itemUuidsToFetch,
        itemContentSizes,
      })

      if (transferLimitBreached) {
        break
      }
    }

    return itemUuidsToFetch
  }

  async computeItemUuidBundlesToFetch(itemQuery: ItemQuery, bytesTransferLimit: number): Promise<Array<Array<string>>> {
    let itemUuidsToFetch = []
    const itemContentSizes = await this.itemRepository.findContentSizeForComputingTransferLimit(itemQuery)
    let totalContentSizeInBytes = 0
    const bundles = []
    for (const itemContentSize of itemContentSizes) {
      const contentSize = itemContentSize.contentSize ?? 0

      itemUuidsToFetch.push(itemContentSize.uuid)
      totalContentSizeInBytes += contentSize

      const transferLimitBreached = this.isTransferLimitBreached({
        totalContentSizeInBytes,
        bytesTransferLimit,
        itemUuidsToFetch,
        itemContentSizes,
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
    itemContentSizes: Array<{ uuid: string; contentSize: number | null }>
  }): boolean {
    const transferLimitBreached = dto.totalContentSizeInBytes >= dto.bytesTransferLimit
    const transferLimitBreachedAtFirstItem =
      transferLimitBreached && dto.itemUuidsToFetch.length === 1 && dto.itemContentSizes.length > 1

    if (transferLimitBreachedAtFirstItem) {
      this.logger.warn(
        `Item ${dto.itemUuidsToFetch[0]} is breaching the content size transfer limit: ${dto.bytesTransferLimit}`,
      )
    }

    return transferLimitBreached && !transferLimitBreachedAtFirstItem
  }
}

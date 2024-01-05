import { Logger } from 'winston'

import { ItemTransferCalculatorInterface } from './ItemTransferCalculatorInterface'
import { ItemContentSizeDescriptor } from './ItemContentSizeDescriptor'
import { Uuid } from '@standardnotes/domain-core'

export class ItemTransferCalculator implements ItemTransferCalculatorInterface {
  constructor(private logger: Logger) {}

  async computeItemUuidsToFetch(
    itemContentSizeDescriptors: ItemContentSizeDescriptor[],
    bytesTransferLimit: number,
    userUuid: Uuid,
  ): Promise<{ uuids: Array<string>; transferLimitBreachedBeforeEndOfItems: boolean }> {
    const itemUuidsToFetch = []
    let totalContentSizeInBytes = 0
    let transferLimitBreached = false
    for (const itemContentSize of itemContentSizeDescriptors) {
      const contentSize = itemContentSize.props.contentSize ?? 0

      itemUuidsToFetch.push(itemContentSize.props.uuid.value)
      totalContentSizeInBytes += contentSize

      transferLimitBreached = this.isTransferLimitBreached({
        totalContentSizeInBytes,
        bytesTransferLimit,
        itemUuidsToFetch,
        itemContentSizeDescriptors,
        userUuid,
      })

      if (transferLimitBreached) {
        break
      }
    }

    return {
      uuids: itemUuidsToFetch,
      transferLimitBreachedBeforeEndOfItems:
        transferLimitBreached && itemUuidsToFetch.length < itemContentSizeDescriptors.length,
    }
  }

  async computeItemUuidBundlesToFetch(
    itemContentSizeDescriptors: ItemContentSizeDescriptor[],
    bytesTransferLimit: number,
    userUuid: Uuid,
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
        userUuid,
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
    userUuid: Uuid
  }): boolean {
    const transferLimitBreached = dto.totalContentSizeInBytes >= dto.bytesTransferLimit
    const transferLimitBreachedAtFirstItem =
      transferLimitBreached && dto.itemUuidsToFetch.length === 1 && dto.itemContentSizeDescriptors.length > 1

    if (transferLimitBreachedAtFirstItem) {
      this.logger.warn('Item is breaching the content size transfer limit at first item in the bundle to fetch.', {
        codeTag: 'ItemTransferCalculator',
        itemUuid: dto.itemUuidsToFetch[0],
        totalContentSizeInBytes: dto.totalContentSizeInBytes,
        bytesTransferLimit: dto.bytesTransferLimit,
        userId: dto.userUuid.value,
      })
    }

    return transferLimitBreached && !transferLimitBreachedAtFirstItem
  }
}

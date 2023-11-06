import 'reflect-metadata'

import { Logger } from 'winston'

import { ItemTransferCalculator } from './ItemTransferCalculator'
import { ItemContentSizeDescriptor } from './ItemContentSizeDescriptor'

describe('ItemTransferCalculator', () => {
  let logger: Logger

  const createCalculator = () => new ItemTransferCalculator(logger)

  beforeEach(() => {
    logger = {} as jest.Mocked<Logger>
    logger.warn = jest.fn()
  })

  describe('fetching uuids', () => {
    it('should compute uuids to fetch based on transfer limit - one item overlaping limit', async () => {
      const itemContentSizeDescriptors = [
        ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000000', 20).getValue(),
        ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000001', 20).getValue(),
        ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000002', 20).getValue(),
      ]

      const result = await createCalculator().computeItemUuidsToFetch(itemContentSizeDescriptors, 50)

      expect(result).toEqual({
        uuids: [
          '00000000-0000-0000-0000-000000000000',
          '00000000-0000-0000-0000-000000000001',
          '00000000-0000-0000-0000-000000000002',
        ],
        transferLimitBreachedBeforeEndOfItems: false,
      })
    })

    it('should compute uuids to fetch based on transfer limit - exact limit fit', async () => {
      const itemContentSizeDescriptors = [
        ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000000', 20).getValue(),
        ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000001', 20).getValue(),
        ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000002', 20).getValue(),
      ]

      const result = await createCalculator().computeItemUuidsToFetch(itemContentSizeDescriptors, 40)

      expect(result).toEqual({
        uuids: ['00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001'],
        transferLimitBreachedBeforeEndOfItems: true,
      })
    })

    it('should compute uuids to fetch based on transfer limit - content size not defined on an item', async () => {
      const itemContentSizeDescriptors = [
        ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000000', 20).getValue(),
        ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000001', 20).getValue(),
        ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000002', null).getValue(),
      ]

      const result = await createCalculator().computeItemUuidsToFetch(itemContentSizeDescriptors, 50)

      expect(result).toEqual({
        uuids: [
          '00000000-0000-0000-0000-000000000000',
          '00000000-0000-0000-0000-000000000001',
          '00000000-0000-0000-0000-000000000002',
        ],
        transferLimitBreachedBeforeEndOfItems: false,
      })
    })

    it('should compute uuids to fetch based on transfer limit - first item over the limit', async () => {
      const itemContentSizeDescriptors = [
        ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000000', 50).getValue(),
        ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000001', 20).getValue(),
        ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000002', 20).getValue(),
      ]

      const result = await createCalculator().computeItemUuidsToFetch(itemContentSizeDescriptors, 40)

      expect(result).toEqual({
        uuids: ['00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001'],
        transferLimitBreachedBeforeEndOfItems: true,
      })
    })
  })

  describe('fetching bundles', () => {
    it('should compute uuid bundles to fetch based on transfer limit - one item overlaping limit', async () => {
      const itemContentSizeDescriptors = [
        ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000000', 20).getValue(),
        ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000001', 20).getValue(),
        ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000002', 20).getValue(),
      ]

      const result = await createCalculator().computeItemUuidBundlesToFetch(itemContentSizeDescriptors, 50)

      expect(result).toEqual([
        [
          '00000000-0000-0000-0000-000000000000',
          '00000000-0000-0000-0000-000000000001',
          '00000000-0000-0000-0000-000000000002',
        ],
      ])
    })

    it('should compute uuid bundles to fetch based on transfer limit - exact limit fit', async () => {
      const itemContentSizeDescriptors = [
        ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000000', 20).getValue(),
        ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000001', 20).getValue(),
        ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000002', 20).getValue(),
      ]

      const result = await createCalculator().computeItemUuidBundlesToFetch(itemContentSizeDescriptors, 40)

      expect(result).toEqual([
        ['00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001'],
        ['00000000-0000-0000-0000-000000000002'],
      ])
    })

    it('should compute uuid bundles to fetch based on transfer limit - content size not defined on an item', async () => {
      const itemContentSizeDescriptors = [
        ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000000', 20).getValue(),
        ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000001', 20).getValue(),
        ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000002', null).getValue(),
      ]

      const result = await createCalculator().computeItemUuidBundlesToFetch(itemContentSizeDescriptors, 50)

      expect(result).toEqual([
        [
          '00000000-0000-0000-0000-000000000000',
          '00000000-0000-0000-0000-000000000001',
          '00000000-0000-0000-0000-000000000002',
        ],
      ])
    })

    it('should compute uuid bundles to fetch based on transfer limit - first item over the limit', async () => {
      const itemContentSizeDescriptors = [
        ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000000', 50).getValue(),
        ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000001', 20).getValue(),
        ItemContentSizeDescriptor.create('00000000-0000-0000-0000-000000000002', 20).getValue(),
      ]

      const result = await createCalculator().computeItemUuidBundlesToFetch(itemContentSizeDescriptors, 40)

      expect(result).toEqual([
        ['00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001'],
        ['00000000-0000-0000-0000-000000000002'],
      ])
    })
  })
})

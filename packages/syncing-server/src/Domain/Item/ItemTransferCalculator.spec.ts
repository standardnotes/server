import 'reflect-metadata'

import { Logger } from 'winston'
import { ItemQuery } from './ItemQuery'

import { ItemRepositoryInterface } from './ItemRepositoryInterface'

import { ItemTransferCalculator } from './ItemTransferCalculator'

describe('ItemTransferCalculator', () => {
  let itemRepository: ItemRepositoryInterface
  let logger: Logger

  const createCalculator = () => new ItemTransferCalculator(itemRepository, logger)

  beforeEach(() => {
    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findContentSizeForComputingTransferLimit = jest.fn().mockReturnValue([])

    logger = {} as jest.Mocked<Logger>
    logger.warn = jest.fn()
  })

  describe('fetching uuids', () => {
    it('should compute uuids to fetch based on transfer limit - one item overlaping limit', async () => {
      const query = {} as jest.Mocked<ItemQuery>
      itemRepository.findContentSizeForComputingTransferLimit = jest.fn().mockReturnValue([
        {
          uuid: '1-2-3',
          contentSize: 20,
        },
        {
          uuid: '2-3-4',
          contentSize: 20,
        },
        {
          uuid: '3-4-5',
          contentSize: 20,
        },
      ])

      const result = await createCalculator().computeItemUuidsToFetch(query, 50)

      expect(result).toEqual(['1-2-3', '2-3-4', '3-4-5'])
    })

    it('should compute uuids to fetch based on transfer limit - exact limit fit', async () => {
      const query = {} as jest.Mocked<ItemQuery>
      itemRepository.findContentSizeForComputingTransferLimit = jest.fn().mockReturnValue([
        {
          uuid: '1-2-3',
          contentSize: 20,
        },
        {
          uuid: '2-3-4',
          contentSize: 20,
        },
        {
          uuid: '3-4-5',
          contentSize: 20,
        },
      ])

      const result = await createCalculator().computeItemUuidsToFetch(query, 40)

      expect(result).toEqual(['1-2-3', '2-3-4'])
    })

    it('should compute uuids to fetch based on transfer limit - content size not defined on an item', async () => {
      const query = {} as jest.Mocked<ItemQuery>
      itemRepository.findContentSizeForComputingTransferLimit = jest.fn().mockReturnValue([
        {
          uuid: '1-2-3',
          contentSize: 20,
        },
        {
          uuid: '2-3-4',
          contentSize: 20,
        },
        {
          uuid: '3-4-5',
        },
      ])

      const result = await createCalculator().computeItemUuidsToFetch(query, 50)

      expect(result).toEqual(['1-2-3', '2-3-4', '3-4-5'])
    })

    it('should compute uuids to fetch based on transfer limit - first item over the limit', async () => {
      const query = {} as jest.Mocked<ItemQuery>
      itemRepository.findContentSizeForComputingTransferLimit = jest.fn().mockReturnValue([
        {
          uuid: '1-2-3',
          contentSize: 50,
        },
        {
          uuid: '2-3-4',
          contentSize: 20,
        },
        {
          uuid: '3-4-5',
          contentSize: 20,
        },
      ])

      const result = await createCalculator().computeItemUuidsToFetch(query, 40)

      expect(result).toEqual(['1-2-3', '2-3-4'])
    })
  })

  describe('fetching bundles', () => {
    it('should compute uuid bundles to fetch based on transfer limit - one item overlaping limit', async () => {
      const query = {} as jest.Mocked<ItemQuery>
      itemRepository.findContentSizeForComputingTransferLimit = jest.fn().mockReturnValue([
        {
          uuid: '1-2-3',
          contentSize: 20,
        },
        {
          uuid: '2-3-4',
          contentSize: 20,
        },
        {
          uuid: '3-4-5',
          contentSize: 20,
        },
      ])

      const result = await createCalculator().computeItemUuidBundlesToFetch(query, 50)

      expect(result).toEqual([['1-2-3', '2-3-4', '3-4-5']])
    })

    it('should compute uuid bundles to fetch based on transfer limit - exact limit fit', async () => {
      const query = {} as jest.Mocked<ItemQuery>
      itemRepository.findContentSizeForComputingTransferLimit = jest.fn().mockReturnValue([
        {
          uuid: '1-2-3',
          contentSize: 20,
        },
        {
          uuid: '2-3-4',
          contentSize: 20,
        },
        {
          uuid: '3-4-5',
          contentSize: 20,
        },
      ])

      const result = await createCalculator().computeItemUuidBundlesToFetch(query, 40)

      expect(result).toEqual([['1-2-3', '2-3-4'], ['3-4-5']])
    })

    it('should compute uuid bundles to fetch based on transfer limit - content size not defined on an item', async () => {
      const query = {} as jest.Mocked<ItemQuery>
      itemRepository.findContentSizeForComputingTransferLimit = jest.fn().mockReturnValue([
        {
          uuid: '1-2-3',
          contentSize: 20,
        },
        {
          uuid: '2-3-4',
          contentSize: 20,
        },
        {
          uuid: '3-4-5',
        },
      ])

      const result = await createCalculator().computeItemUuidBundlesToFetch(query, 50)

      expect(result).toEqual([['1-2-3', '2-3-4', '3-4-5']])
    })

    it('should compute uuid bundles to fetch based on transfer limit - first item over the limit', async () => {
      const query = {} as jest.Mocked<ItemQuery>
      itemRepository.findContentSizeForComputingTransferLimit = jest.fn().mockReturnValue([
        {
          uuid: '1-2-3',
          contentSize: 50,
        },
        {
          uuid: '2-3-4',
          contentSize: 20,
        },
        {
          uuid: '3-4-5',
          contentSize: 20,
        },
      ])

      const result = await createCalculator().computeItemUuidBundlesToFetch(query, 40)

      expect(result).toEqual([['1-2-3', '2-3-4'], ['3-4-5']])
    })
  })
})

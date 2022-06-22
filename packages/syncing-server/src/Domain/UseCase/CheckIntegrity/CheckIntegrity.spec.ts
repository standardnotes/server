import 'reflect-metadata'

import { StatisticsStoreInterface } from '@standardnotes/analytics'

import { ItemRepositoryInterface } from '../../Item/ItemRepositoryInterface'

import { CheckIntegrity } from './CheckIntegrity'
import { ContentType } from '@standardnotes/common'

describe('CheckIntegrity', () => {
  let itemRepository: ItemRepositoryInterface
  let statisticsStore: StatisticsStoreInterface

  const createUseCase = () => new CheckIntegrity(itemRepository, statisticsStore)

  beforeEach(() => {
    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findItemsForComputingIntegrityPayloads = jest.fn().mockReturnValue([
      {
        uuid: '1-2-3',
        updated_at_timestamp: 1,
        content_type: ContentType.Note,
      },
      {
        uuid: '2-3-4',
        updated_at_timestamp: 2,
        content_type: ContentType.Note,
      },
      {
        uuid: '3-4-5',
        updated_at_timestamp: 3,
        content_type: ContentType.Note,
      },
      {
        uuid: '4-5-6',
        updated_at_timestamp: 4,
        content_type: ContentType.ItemsKey,
      },
    ])

    statisticsStore = {} as jest.Mocked<StatisticsStoreInterface>
    statisticsStore.incrementOutOfSyncIncidents = jest.fn()
  })

  it('should return an empty result if there are no integrity mismatches', async () => {
    expect(
      await createUseCase().execute({
        userUuid: '1-2-3',
        integrityPayloads: [
          {
            uuid: '1-2-3',
            updated_at_timestamp: 1,
          },
          {
            uuid: '2-3-4',
            updated_at_timestamp: 2,
          },
          {
            uuid: '3-4-5',
            updated_at_timestamp: 3,
          },
        ],
      }),
    ).toEqual({
      mismatches: [],
    })
  })

  it('should return a mismatch item that has a different update at timemstap', async () => {
    expect(
      await createUseCase().execute({
        userUuid: '1-2-3',
        integrityPayloads: [
          {
            uuid: '1-2-3',
            updated_at_timestamp: 1,
          },
          {
            uuid: '2-3-4',
            updated_at_timestamp: 1,
          },
          {
            uuid: '3-4-5',
            updated_at_timestamp: 3,
          },
        ],
      }),
    ).toEqual({
      mismatches: [
        {
          uuid: '2-3-4',
          updated_at_timestamp: 2,
        },
      ],
    })

    expect(statisticsStore.incrementOutOfSyncIncidents).toHaveBeenCalled()
  })

  it('should return a mismatch item that is missing on the client side', async () => {
    expect(
      await createUseCase().execute({
        userUuid: '1-2-3',
        integrityPayloads: [
          {
            uuid: '1-2-3',
            updated_at_timestamp: 1,
          },
          {
            uuid: '2-3-4',
            updated_at_timestamp: 2,
          },
        ],
      }),
    ).toEqual({
      mismatches: [
        {
          uuid: '3-4-5',
          updated_at_timestamp: 3,
        },
      ],
    })
  })
})

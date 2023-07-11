import 'reflect-metadata'

import { ContentType } from '@standardnotes/domain-core'

import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'

import { CheckIntegrity } from './CheckIntegrity'

describe('CheckIntegrity', () => {
  let itemRepository: ItemRepositoryInterface

  const createUseCase = () => new CheckIntegrity(itemRepository)

  beforeEach(() => {
    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findItemsForComputingIntegrityPayloads = jest.fn().mockReturnValue([
      {
        uuid: '1-2-3',
        updated_at_timestamp: 1,
        content_type: ContentType.TYPES.Note,
      },
      {
        uuid: '2-3-4',
        updated_at_timestamp: 2,
        content_type: ContentType.TYPES.Note,
      },
      {
        uuid: '3-4-5',
        updated_at_timestamp: 3,
        content_type: ContentType.TYPES.Note,
      },
      {
        uuid: '4-5-6',
        updated_at_timestamp: 4,
        content_type: ContentType.TYPES.ItemsKey,
      },
      {
        uuid: '5-6-7',
        updated_at_timestamp: 5,
        content_type: ContentType.TYPES.File,
      },
    ])
  })

  it('should return an empty result if there are no integrity mismatches', async () => {
    const result = await createUseCase().execute({
      userUuid: '1-2-3',
      freeUser: false,
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
        {
          uuid: '5-6-7',
          updated_at_timestamp: 5,
        },
      ],
    })
    expect(result.getValue()).toEqual([])
  })

  it('should return a mismatch item that has a different update at timemstap', async () => {
    const result = await createUseCase().execute({
      userUuid: '1-2-3',
      freeUser: false,
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
        {
          uuid: '5-6-7',
          updated_at_timestamp: 5,
        },
      ],
    })
    expect(result.getValue()).toEqual([
      {
        uuid: '2-3-4',
        updated_at_timestamp: 2,
      },
    ])
  })

  it('should return a mismatch item that is missing on the client side', async () => {
    const result = await createUseCase().execute({
      userUuid: '1-2-3',
      freeUser: false,
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
          uuid: '5-6-7',
          updated_at_timestamp: 5,
        },
      ],
    })
    expect(result.getValue()).toEqual([
      {
        uuid: '3-4-5',
        updated_at_timestamp: 3,
      },
    ])
  })
})

import 'reflect-metadata'

import { MapperInterface } from '@standardnotes/domain-core'

import { Item } from '../Item'
import { ItemConflict } from '../ItemConflict'
import { SyncResponseFactory20200115 } from './SyncResponseFactory20200115'
import { ItemHttpRepresentation } from '../../../Mapping/Http/ItemHttpRepresentation'
import { SavedItemHttpRepresentation } from '../../../Mapping/Http/SavedItemHttpRepresentation'
import { ItemConflictHttpRepresentation } from '../../../Mapping/Http/ItemConflictHttpRepresentation'

describe('SyncResponseFactory20200115', () => {
  let itemMapper: MapperInterface<Item, ItemHttpRepresentation>
  let savedItemMapper: MapperInterface<Item, SavedItemHttpRepresentation>
  let itemConflictMapper: MapperInterface<ItemConflict, ItemConflictHttpRepresentation>
  let itemProjection: ItemHttpRepresentation
  let savedItemHttpRepresentation: SavedItemHttpRepresentation
  let itemConflictProjection: ItemConflictHttpRepresentation
  let item1: Item
  let item2: Item
  let itemConflict: ItemConflict

  const createFactory = () => new SyncResponseFactory20200115(itemMapper, itemConflictMapper, savedItemMapper)

  beforeEach(() => {
    itemProjection = {
      uuid: '2-3-4',
    } as jest.Mocked<ItemHttpRepresentation>

    itemMapper = {} as jest.Mocked<MapperInterface<Item, ItemHttpRepresentation>>
    itemMapper.toProjection = jest.fn().mockReturnValue(itemProjection)

    itemConflictMapper = {} as jest.Mocked<MapperInterface<ItemConflict, ItemConflictHttpRepresentation>>
    itemConflictMapper.toProjection = jest.fn().mockReturnValue(itemConflictProjection)

    savedItemHttpRepresentation = {
      uuid: '1-2-3',
    } as jest.Mocked<SavedItemHttpRepresentation>

    savedItemMapper = {} as jest.Mocked<MapperInterface<Item, SavedItemHttpRepresentation>>
    savedItemMapper.toProjection = jest.fn().mockReturnValue(savedItemHttpRepresentation)

    item1 = {} as jest.Mocked<Item>

    item2 = {} as jest.Mocked<Item>

    itemConflict = {} as jest.Mocked<ItemConflict>
  })

  it('should turn sync items response into a sync response for API Version 20200115', async () => {
    expect(
      await createFactory().createResponse({
        retrievedItems: [item1],
        savedItems: [item2],
        conflicts: [itemConflict],
        syncToken: 'sync-test',
        cursorToken: 'cursor-test',
      }),
    ).toEqual({
      retrieved_items: [itemProjection],
      saved_items: [savedItemHttpRepresentation],
      conflicts: [itemConflictProjection],
      sync_token: 'sync-test',
      cursor_token: 'cursor-test',
    })
  })
})

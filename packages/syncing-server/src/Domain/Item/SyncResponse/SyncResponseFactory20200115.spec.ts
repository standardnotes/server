import 'reflect-metadata'
import { ProjectorInterface } from '../../../Projection/ProjectorInterface'
import { Item } from '../Item'
import { ItemConflict } from '../ItemConflict'
import { ItemConflictProjection } from '../../../Projection/ItemConflictProjection'
import { ItemProjection } from '../../../Projection/ItemProjection'

import { SyncResponseFactory20200115 } from './SyncResponseFactory20200115'
import { SavedItemProjection } from '../../../Projection/SavedItemProjection'

describe('SyncResponseFactory20200115', () => {
  let itemProjector: ProjectorInterface<Item, ItemProjection>
  let savedItemProjector: ProjectorInterface<Item, SavedItemProjection>
  let itemConflictProjector: ProjectorInterface<ItemConflict, ItemConflictProjection>
  let itemProjection: ItemProjection
  let savedItemProjection: SavedItemProjection
  let itemConflictProjection: ItemConflictProjection
  let item1: Item
  let item2: Item
  let itemConflict: ItemConflict

  const createFactory = () => new SyncResponseFactory20200115(itemProjector, itemConflictProjector, savedItemProjector)

  beforeEach(() => {
    itemProjection = {
      uuid: '2-3-4',
    } as jest.Mocked<ItemProjection>

    itemProjector = {} as jest.Mocked<ProjectorInterface<Item, ItemProjection>>
    itemProjector.projectFull = jest.fn().mockReturnValue(itemProjection)

    itemConflictProjector = {} as jest.Mocked<ProjectorInterface<ItemConflict, ItemConflictProjection>>
    itemConflictProjector.projectFull = jest.fn().mockReturnValue(itemConflictProjection)

    savedItemProjection = {
      uuid: '1-2-3',
    } as jest.Mocked<SavedItemProjection>

    savedItemProjector = {} as jest.Mocked<ProjectorInterface<Item, SavedItemProjection>>
    savedItemProjector.projectFull = jest.fn().mockReturnValue(savedItemProjection)

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
      saved_items: [savedItemProjection],
      conflicts: [itemConflictProjection],
      sync_token: 'sync-test',
      cursor_token: 'cursor-test',
    })
  })
})

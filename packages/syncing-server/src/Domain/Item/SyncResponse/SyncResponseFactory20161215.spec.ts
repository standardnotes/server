import 'reflect-metadata'
import { ProjectorInterface } from '../../../Projection/ProjectorInterface'

import { Item } from '../Item'
import { ItemHash } from '../ItemHash'
import { ItemProjection } from '../../../Projection/ItemProjection'
import { SyncResponseFactory20161215 } from './SyncResponseFactory20161215'
import { ConflictType } from '@standardnotes/responses'

describe('SyncResponseFactory20161215', () => {
  let itemProjector: ProjectorInterface<Item, ItemProjection>
  let item1Projection: ItemProjection
  let item2Projection: ItemProjection
  let item1: Item
  let item2: Item

  const createFactory = () => new SyncResponseFactory20161215(itemProjector)

  beforeEach(() => {
    item1Projection = {
      uuid: '1-2-3',
    } as jest.Mocked<ItemProjection>
    item2Projection = {
      uuid: '2-3-4',
    } as jest.Mocked<ItemProjection>

    itemProjector = {} as jest.Mocked<ProjectorInterface<Item, ItemProjection>>
    itemProjector.projectFull = jest.fn().mockImplementation((item: Item) => {
      if (item.uuid === '1-2-3') {
        return item1Projection
      } else if (item.uuid === '2-3-4') {
        return item2Projection
      }

      return undefined
    })

    item1 = {
      uuid: '1-2-3',
      updatedAtTimestamp: 100,
    } as jest.Mocked<Item>

    item2 = {
      uuid: '2-3-4',
    } as jest.Mocked<Item>
  })

  it('should turn sync items response into a sync response for API Version 20161215', async () => {
    const itemHash1 = {} as jest.Mocked<ItemHash>
    expect(
      await createFactory().createResponse({
        retrievedItems: [item1],
        savedItems: [item2],
        conflicts: [
          {
            serverItem: item1,
            type: ConflictType.ConflictingData,
          },
          {
            unsavedItem: itemHash1,
            type: ConflictType.UuidConflict,
          },
        ],
        syncToken: 'sync-test',
        cursorToken: 'cursor-test',
      }),
    ).toEqual({
      retrieved_items: [item1Projection],
      saved_items: [item2Projection],
      unsaved: [
        {
          item: itemHash1,
          error: {
            tag: 'uuid_conflict',
          },
        },
      ],
      sync_token: 'sync-test',
      cursor_token: 'cursor-test',
    })
  })

  it('should pick out conflicts between saved and retrieved items and remove them from the later', async () => {
    const itemHash1 = {} as jest.Mocked<ItemHash>

    const duplicateItem1 = Object.assign({}, item1)
    duplicateItem1.updatedAtTimestamp = item1.updatedAtTimestamp + 21_000_000

    const duplicateItem2 = Object.assign({}, item2)

    expect(
      await createFactory().createResponse({
        retrievedItems: [duplicateItem1, duplicateItem2],
        savedItems: [item1, item2],
        conflicts: [
          {
            unsavedItem: itemHash1,
            type: ConflictType.UuidConflict,
          },
        ],
        syncToken: 'sync-test',
        cursorToken: 'cursor-test',
      }),
    ).toEqual({
      retrieved_items: [],
      saved_items: [item1Projection, item2Projection],
      unsaved: [
        {
          error: {
            tag: 'uuid_conflict',
          },
          item: itemHash1,
        },
        {
          error: {
            tag: 'sync_conflict',
          },
          item: item1Projection,
        },
      ],
      sync_token: 'sync-test',
      cursor_token: 'cursor-test',
    })
  })
})

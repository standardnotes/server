import 'reflect-metadata'

import { Item } from '../Item'
import { ItemHash } from '../ItemHash'
import { SyncResponseFactory20161215 } from './SyncResponseFactory20161215'
import { ConflictType } from '@standardnotes/responses'
import { ContentType, Dates, MapperInterface, Timestamps, UniqueEntityId, Uuid } from '@standardnotes/domain-core'
import { ItemHttpRepresentation } from '../../../Mapping/Http/ItemHttpRepresentation'

describe('SyncResponseFactory20161215', () => {
  let itemProjector: MapperInterface<Item, ItemHttpRepresentation>
  let item1Projection: ItemHttpRepresentation
  let item2Projection: ItemHttpRepresentation
  let item1: Item
  let item2: Item

  const createFactory = () => new SyncResponseFactory20161215(itemProjector)

  beforeEach(() => {
    item1Projection = {
      uuid: '1-2-3',
    } as jest.Mocked<ItemHttpRepresentation>
    item2Projection = {
      uuid: '2-3-4',
    } as jest.Mocked<ItemHttpRepresentation>

    itemProjector = {} as jest.Mocked<MapperInterface<Item, ItemHttpRepresentation>>
    itemProjector.toProjection = jest.fn().mockImplementation((item: Item) => {
      if (item.id.toString() === '00000000-0000-0000-0000-000000000000') {
        return item1Projection
      } else if (item.id.toString() === '00000000-0000-0000-0000-000000000001') {
        return item2Projection
      }

      return undefined
    })

    item1 = Item.create(
      {
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        updatedWithSession: null,
        content: 'foobar',
        contentType: ContentType.create(ContentType.TYPES.Note).getValue(),
        encItemKey: null,
        authHash: null,
        itemsKeyId: null,
        duplicateOf: null,
        deleted: false,
        dates: Dates.create(new Date(1616164633241311), new Date(1616164633241311)).getValue(),
        timestamps: Timestamps.create(1616164633241311, 1616164633241311).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
    ).getValue()

    item2 = Item.create(
      {
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        updatedWithSession: null,
        content: 'foobar',
        contentType: ContentType.create(ContentType.TYPES.Note).getValue(),
        encItemKey: null,
        authHash: null,
        itemsKeyId: null,
        duplicateOf: null,
        deleted: false,
        dates: Dates.create(new Date(1616164633241311), new Date(1616164633241311)).getValue(),
        timestamps: Timestamps.create(1616164633241311, 1616164633241311).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000001'),
    ).getValue()
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

    const duplicateItem1 = Item.create(
      {
        ...item1.props,
        timestamps: Timestamps.create(
          item1.props.timestamps.createdAt,
          item1.props.timestamps.updatedAt + 21_000_000,
        ).getValue(),
      },
      item1.id,
    ).getValue()

    const duplicateItem2 = Item.create({ ...item2.props }).getValue()

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

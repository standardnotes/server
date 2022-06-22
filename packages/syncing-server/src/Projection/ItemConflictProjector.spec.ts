import 'reflect-metadata'

import { ProjectorInterface } from './ProjectorInterface'
import { Item } from '../Domain/Item/Item'
import { ItemConflict } from '../Domain/Item/ItemConflict'
import { ItemConflictProjector } from './ItemConflictProjector'
import { ItemHash } from '../Domain/Item/ItemHash'
import { ItemProjection } from './ItemProjection'
import { ConflictType } from '@standardnotes/responses'

describe('ItemConflictProjector', () => {
  let itemProjector: ProjectorInterface<Item, ItemProjection>
  let itemProjection: ItemProjection
  let itemConflict1: ItemConflict
  let itemConflict2: ItemConflict
  let item: Item
  let itemHash: ItemHash

  const createProjector = () => new ItemConflictProjector(itemProjector)

  beforeEach(() => {
    itemProjection = {} as jest.Mocked<ItemProjection>

    itemProjector = {} as jest.Mocked<ProjectorInterface<Item, ItemProjection>>
    itemProjector.projectFull = jest.fn().mockReturnValue(itemProjection)

    item = {} as jest.Mocked<Item>

    itemHash = {} as jest.Mocked<ItemHash>

    itemConflict1 = {
      serverItem: item,
      type: ConflictType.ConflictingData,
    }

    itemConflict2 = {
      unsavedItem: itemHash,
      type: ConflictType.UuidConflict,
    }
  })

  it('should create a full projection of a server item conflict', async () => {
    expect(await createProjector().projectFull(itemConflict1)).toMatchObject({
      server_item: itemProjection,
      type: ConflictType.ConflictingData,
    })
  })

  it('should create a full projection of an unsaved item conflict', async () => {
    expect(await createProjector().projectFull(itemConflict2)).toMatchObject({
      unsaved_item: itemHash,
      type: 'uuid_conflict',
    })
  })

  it('should throw error on custom projection', async () => {
    let error = null
    try {
      await createProjector().projectCustom('test', itemConflict1)
    } catch (e) {
      error = e
    }
    expect((error as Error).message).toEqual('not implemented')
  })

  it('should throw error on simple projection', async () => {
    let error = null
    try {
      await createProjector().projectSimple(itemConflict1)
    } catch (e) {
      error = e
    }
    expect((error as Error).message).toEqual('not implemented')
  })
})

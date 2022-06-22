import 'reflect-metadata'
import { TimerInterface } from '@standardnotes/time'

import { Item } from '../Domain/Item/Item'
import { SavedItemProjector } from './SavedItemProjector'
import { ContentType } from '@standardnotes/common'

describe('SavedItemProjector', () => {
  let item: Item
  let timer: TimerInterface

  const createProjector = () => new SavedItemProjector(timer)

  beforeEach(() => {
    timer = {} as jest.Mocked<TimerInterface>
    timer.convertMicrosecondsToStringDate = jest.fn().mockReturnValue('2021-04-15T08:00:00.123456Z')

    item = new Item()
    item.uuid = '1-2-3'
    item.itemsKeyId = '2-3-4'
    item.duplicateOf = null
    item.encItemKey = '3-4-5'
    item.content = 'test'
    item.contentType = ContentType.Note
    item.authHash = 'asd'
    item.deleted = false
    item.createdAtTimestamp = 123
    item.updatedAtTimestamp = 123
  })

  it('should create a full projection of an item', async () => {
    expect(await createProjector().projectFull(item)).toEqual({
      uuid: '1-2-3',
      duplicate_of: null,
      content_type: 'Note',
      auth_hash: 'asd',
      deleted: false,
      created_at: '2021-04-15T08:00:00.123456Z',
      created_at_timestamp: 123,
      updated_at: '2021-04-15T08:00:00.123456Z',
      updated_at_timestamp: 123,
    })
  })

  it('should throw error on custom projection', async () => {
    let error = null
    try {
      await createProjector().projectCustom('test', item)
    } catch (e) {
      error = e
    }
    expect((error as Error).message).toEqual('not implemented')
  })

  it('should throw error on simple projection', async () => {
    let error = null
    try {
      await createProjector().projectSimple(item)
    } catch (e) {
      error = e
    }
    expect((error as Error).message).toEqual('not implemented')
  })
})

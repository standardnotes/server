import 'reflect-metadata'
import { TimerInterface } from '@standardnotes/time'

import { Item } from '../Domain/Item/Item'
import { ItemProjector } from './ItemProjector'
import { ContentType } from '@standardnotes/common'

describe('ItemProjector', () => {
  let item: Item
  let timer: TimerInterface

  const createProjector = () => new ItemProjector(timer)

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
    item.updatedWithSession = '7-6-5'
    item.userUuid = 'u1-2-3'
  })

  it('should create a full projection of an item', async () => {
    expect(await createProjector().projectFull(item)).toMatchObject({
      uuid: '1-2-3',
      items_key_id: '2-3-4',
      duplicate_of: null,
      enc_item_key: '3-4-5',
      content: 'test',
      content_type: 'Note',
      auth_hash: 'asd',
      deleted: false,
      created_at: '2021-04-15T08:00:00.123456Z',
      updated_at: '2021-04-15T08:00:00.123456Z',
      updated_with_session: '7-6-5',
    })
  })

  it('should create a custom projection of an item', async () => {
    expect(await createProjector().projectCustom('dump', item)).toMatchObject({
      uuid: '1-2-3',
      items_key_id: '2-3-4',
      duplicate_of: null,
      enc_item_key: '3-4-5',
      content: 'test',
      content_type: 'Note',
      auth_hash: 'asd',
      deleted: false,
      created_at: '2021-04-15T08:00:00.123456Z',
      updated_at: '2021-04-15T08:00:00.123456Z',
      updated_with_session: '7-6-5',
      user_uuid: 'u1-2-3',
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

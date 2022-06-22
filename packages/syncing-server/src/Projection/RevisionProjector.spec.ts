import { ContentType, RoleName } from '@standardnotes/common'
import { TimerInterface } from '@standardnotes/time'
import { Item } from '../Domain/Item/Item'

import { Revision } from '../Domain/Revision/Revision'
import { RevisionServiceInterface } from '../Domain/Revision/RevisionServiceInterface'
import { RevisionProjector } from './RevisionProjector'

describe('RevisionProjector', () => {
  let revision: Revision
  let timer: TimerInterface
  let revisionService: RevisionServiceInterface

  const createProjector = () => new RevisionProjector(timer, revisionService)

  beforeEach(() => {
    revision = new Revision()
    revision.content = 'test'
    revision.contentType = ContentType.Note
    ;(revision.uuid = '123'),
      (revision.itemsKeyId = '123'),
      (revision.item = Promise.resolve({ uuid: '1-2-3' } as Item))

    timer = {} as jest.Mocked<TimerInterface>
    timer.convertDateToISOString = jest.fn().mockReturnValue('2020-11-26T13:34:00.000Z')
    timer.formatDate = jest.fn().mockReturnValue('2020-11-26')

    revisionService = {} as jest.Mocked<RevisionServiceInterface>
    revisionService.calculateRequiredRoleBasedOnRevisionDate = jest.fn().mockReturnValue(RoleName.CoreUser)

    revision.creationDate = new Date(1)
    revision.createdAt = new Date(1)
    revision.updatedAt = new Date(1)
  })

  it('should create a simple projection of a revision', async () => {
    const projection = await createProjector().projectSimple(revision)
    expect(projection).toMatchObject({
      content_type: 'Note',
      created_at: '2020-11-26T13:34:00.000Z',
      updated_at: '2020-11-26T13:34:00.000Z',
      required_role: 'CORE_USER',
      uuid: '123',
    })
  })

  it('should create a full projection of a revision', async () => {
    const projection = await createProjector().projectFull(revision)
    expect(projection).toMatchObject({
      auth_hash: undefined,
      content: 'test',
      content_type: 'Note',
      created_at: '2020-11-26T13:34:00.000Z',
      creation_date: '2020-11-26',
      enc_item_key: undefined,
      required_role: 'CORE_USER',
      item_uuid: '1-2-3',
      items_key_id: '123',
      updated_at: '2020-11-26T13:34:00.000Z',
      uuid: '123',
    })
  })

  it('should throw error on not implemetned custom projection', async () => {
    let error = null
    try {
      await createProjector().projectCustom('test', revision)
    } catch (e) {
      error = e
    }
    expect((error as Error).message).toEqual('not implemented')
  })
})

import { ContentType, RoleName } from '@standardnotes/common'
import { TimerInterface } from '@standardnotes/time'

import { Item } from '../Item/Item'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { Revision } from './Revision'
import { RevisionMetadata } from './RevisionMetadata'
import { RevisionRepositoryInterface } from './RevisionRepositoryInterface'
import { RevisionService } from './RevisionService'

describe('RevisionService', () => {
  let revisionRepository: RevisionRepositoryInterface
  let timer: TimerInterface
  let itemRepository: ItemRepositoryInterface
  let item: Item
  let revision1: Revision
  let revision2: Revision

  const createService = () => new RevisionService(revisionRepository, itemRepository, timer)

  beforeEach(() => {
    revisionRepository = {} as jest.Mocked<RevisionRepositoryInterface>
    revisionRepository.save = jest.fn().mockImplementation((revision: Revision) => {
      revision.uuid = '3-4-5'

      return revision
    })

    timer = {} as jest.Mocked<TimerInterface>
    timer.dateWasNDaysAgo = jest.fn().mockReturnValue(0)

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findByUuid = jest.fn().mockReturnValue({
      userUuid: '1-2-3',
    } as jest.Mocked<Item>)

    revision1 = {
      uuid: '1-2-3',
      item: Promise.resolve({
        uuid: '1-2-3',
      }),
      content: 'content1',
    } as jest.Mocked<Revision>

    revision2 = {
      uuid: '2-3-4',
      item: Promise.resolve({
        uuid: '1-2-3',
      }),
      content: 'content2',
    } as jest.Mocked<Revision>

    revisionRepository.findByItemId = jest.fn().mockReturnValue([revision1, revision2])
    revisionRepository.findMetadataByItemId = jest.fn().mockReturnValue([{} as jest.Mocked<RevisionMetadata>])
    revisionRepository.findOneById = jest.fn().mockReturnValue(revision1)
    revisionRepository.removeByUuid = jest.fn()

    item = {
      authHash: 'test-hash',
      content: 'test-content',
      contentType: ContentType.Note,
      encItemKey: 'test-enc-item-key',
      uuid: '1-2-3',
      itemsKeyId: 'test-items-key-id',
    } as jest.Mocked<Item>
  })

  it('should not remove a revision for a non existing item', async () => {
    itemRepository.findByUuid = jest.fn().mockReturnValue(null)

    expect(
      await createService().removeRevision({
        itemUuid: '1-2-3',
        userUuid: '1-2-3',
        revisionUuid: '3-4-5',
      }),
    ).toBeFalsy()
  })

  it("should not remove a revision for another user's item", async () => {
    itemRepository.findByUuid = jest.fn().mockReturnValue(null)

    expect(
      await createService().removeRevision({
        itemUuid: '1-2-3',
        userUuid: '3-4-5',
        revisionUuid: '3-4-5',
      }),
    ).toBeFalsy()
  })

  it('should remove a revision if user has rights', async () => {
    expect(
      await createService().removeRevision({
        itemUuid: '1-2-3',
        userUuid: '1-2-3',
        revisionUuid: '3-4-5',
      }),
    ).toBeTruthy()

    expect(revisionRepository.removeByUuid).toHaveBeenCalledWith('1-2-3', '3-4-5')
  })

  it('should not get a revision for a non existing item', async () => {
    itemRepository.findByUuid = jest.fn().mockReturnValue(null)

    expect(
      await createService().getRevision({
        itemUuid: '1-2-3',
        userRoles: [RoleName.CoreUser],
        userUuid: '1-2-3',
        revisionUuid: '3-4-5',
      }),
    ).toBeNull()
  })

  it("should not get a revision for another user's item", async () => {
    itemRepository.findByUuid = jest.fn().mockReturnValue(null)

    expect(
      await createService().getRevision({
        itemUuid: '1-2-3',
        userRoles: [RoleName.CoreUser],
        userUuid: '3-4-5',
        revisionUuid: '3-4-5',
      }),
    ).toBeNull()
  })

  it('should not get a revision that does not exist', async () => {
    revisionRepository.findOneById = jest.fn().mockReturnValue(null)

    expect(
      await createService().getRevision({
        itemUuid: '1-2-3',
        userRoles: [RoleName.CoreUser],
        userUuid: '1-2-3',
        revisionUuid: '3-4-5',
      }),
    ).toBeNull()
  })

  it('should get a revision if user has enough permissions', async () => {
    timer.dateWasNDaysAgo = jest.fn().mockReturnValue(2)

    expect(
      await createService().getRevision({
        itemUuid: '1-2-3',
        userRoles: [RoleName.CoreUser],
        userUuid: '1-2-3',
        revisionUuid: '3-4-5',
      }),
    ).toEqual(revision1)
  })

  it('should not get a revision if user has not enough permissions - plus user', async () => {
    timer.dateWasNDaysAgo = jest.fn().mockReturnValue(45)

    expect(
      await createService().getRevision({
        itemUuid: '1-2-3',
        userRoles: [RoleName.CoreUser],
        userUuid: '1-2-3',
        revisionUuid: '3-4-5',
      }),
    ).toBeNull()
  })

  it('should not get a revision if user has not enough permissions - pro user', async () => {
    timer.dateWasNDaysAgo = jest.fn().mockReturnValue(500)

    expect(
      await createService().getRevision({
        itemUuid: '1-2-3',
        userRoles: [RoleName.CoreUser, RoleName.PlusUser],
        userUuid: '1-2-3',
        revisionUuid: '3-4-5',
      }),
    ).toBeNull()
  })

  it('should get revisions metadata for an item', async () => {
    await createService().getRevisionsMetadata('1-2-3', '2-3-4')

    expect(revisionRepository.findMetadataByItemId).toHaveBeenCalledWith('2-3-4')
  })

  it('should not get revisions metadata for an non existing item', async () => {
    itemRepository.findByUuid = jest.fn().mockReturnValue(null)

    expect(await createService().getRevisionsMetadata('1-2-3', '2-3-4')).toEqual([])

    expect(revisionRepository.findMetadataByItemId).not.toHaveBeenCalled()
  })

  it("should not get revisions metadata for another user's item", async () => {
    expect(await createService().getRevisionsMetadata('3-4-5', '4-5-6')).toEqual([])

    expect(revisionRepository.findMetadataByItemId).not.toHaveBeenCalled()
  })

  it('should save a revision for a note item', async () => {
    await createService().createRevision(item)

    expect(revisionRepository.save).toHaveBeenCalledWith({
      uuid: '3-4-5',
      authHash: 'test-hash',
      content: 'test-content',
      contentType: 'Note',
      encItemKey: 'test-enc-item-key',
      item: Promise.resolve(item),
      itemsKeyId: 'test-items-key-id',
      createdAt: expect.any(Date),
      creationDate: expect.any(Date),
      updatedAt: expect.any(Date),
    })
  })

  it('should not save a revision for a non note item', async () => {
    item.contentType = ContentType.ItemsKey
    await createService().createRevision(item)

    expect(revisionRepository.save).not.toHaveBeenCalled()
  })

  it('should copy revisions from one item unto another', async () => {
    revisionRepository.save = jest.fn().mockImplementation((revision) => revision)

    await createService().copyRevisions('1-2-3', '2-3-4')

    expect(revisionRepository.findByItemId).toHaveBeenCalledWith({ itemUuid: '1-2-3' })

    expect(revisionRepository.save).toHaveBeenNthCalledWith(1, {
      item: Promise.resolve(expect.any(Item)),
      content: 'content1',
      uuid: undefined,
    })
    expect(revisionRepository.save).toHaveBeenNthCalledWith(2, {
      item: Promise.resolve(expect.any(Item)),
      content: 'content2',
      uuid: undefined,
    })
  })

  it('should throw while copying revisions from one item unto another if the target item does not exist', async () => {
    itemRepository.findByUuid = jest.fn().mockReturnValue(null)

    let error = null
    try {
      await createService().copyRevisions('1-2-3', '2-3-4')
    } catch (caughtError) {
      error = caughtError
    }

    expect(error).not.toBeNull()
  })
})

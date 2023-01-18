import 'reflect-metadata'

import { RoleName } from '@standardnotes/common'
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
})

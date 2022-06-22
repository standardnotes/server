import 'reflect-metadata'

import { DuplicateItemSyncedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { Item } from '../Item/Item'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { DuplicateItemSyncedEventHandler } from './DuplicateItemSyncedEventHandler'
import { RevisionServiceInterface } from '../Revision/RevisionServiceInterface'

describe('DuplicateItemSyncedEventHandler', () => {
  let itemRepository: ItemRepositoryInterface
  let revisionService: RevisionServiceInterface
  let logger: Logger
  let duplicateItem: Item
  let originalItem: Item
  let event: DuplicateItemSyncedEvent

  const createHandler = () => new DuplicateItemSyncedEventHandler(itemRepository, revisionService, logger)

  beforeEach(() => {
    originalItem = {
      uuid: '1-2-3',
    } as jest.Mocked<Item>

    duplicateItem = {
      uuid: '2-3-4',
      duplicateOf: '1-2-3',
    } as jest.Mocked<Item>

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findByUuidAndUserUuid = jest
      .fn()
      .mockReturnValueOnce(duplicateItem)
      .mockReturnValueOnce(originalItem)

    logger = {} as jest.Mocked<Logger>
    logger.warn = jest.fn()

    revisionService = {} as jest.Mocked<RevisionServiceInterface>
    revisionService.copyRevisions = jest.fn()

    event = {} as jest.Mocked<DuplicateItemSyncedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      userUuid: '1-2-3',
      itemUuid: '2-3-4',
    }
  })

  it('should copy revisions from original item to the duplicate item', async () => {
    await createHandler().handle(event)

    expect(revisionService.copyRevisions).toHaveBeenCalledWith('1-2-3', '2-3-4')
  })

  it('should not copy revisions if original item does not exist', async () => {
    itemRepository.findByUuidAndUserUuid = jest.fn().mockReturnValueOnce(duplicateItem).mockReturnValueOnce(null)

    await createHandler().handle(event)

    expect(revisionService.copyRevisions).not.toHaveBeenCalled()
  })

  it('should not copy revisions if duplicate item does not exist', async () => {
    itemRepository.findByUuidAndUserUuid = jest.fn().mockReturnValueOnce(null).mockReturnValueOnce(originalItem)

    await createHandler().handle(event)

    expect(revisionService.copyRevisions).not.toHaveBeenCalled()
  })

  it('should not copy revisions if duplicate item is not pointing to duplicate anything', async () => {
    duplicateItem.duplicateOf = null
    await createHandler().handle(event)

    expect(revisionService.copyRevisions).not.toHaveBeenCalled()
  })
})

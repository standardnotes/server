import 'reflect-metadata'

import { ItemRevisionCreationRequestedEvent } from '@standardnotes/domain-events'
import { Item } from '../Item/Item'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { ItemRevisionCreationRequestedEventHandler } from './ItemRevisionCreationRequestedEventHandler'
import { RevisionServiceInterface } from '../Revision/RevisionServiceInterface'

describe('ItemRevisionCreationRequestedEventHandler', () => {
  let itemRepository: ItemRepositoryInterface
  let revisionService: RevisionServiceInterface
  let event: ItemRevisionCreationRequestedEvent
  let item: Item

  const createHandler = () => new ItemRevisionCreationRequestedEventHandler(itemRepository, revisionService)

  beforeEach(() => {
    item = {
      uuid: '1-2-3',
      content: 'test',
    } as jest.Mocked<Item>

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findByUuid = jest.fn().mockReturnValue(item)

    revisionService = {} as jest.Mocked<RevisionServiceInterface>
    revisionService.createRevision = jest.fn()

    event = {} as jest.Mocked<ItemRevisionCreationRequestedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      itemUuid: '2-3-4',
    }
  })

  it('should create a revision for an item', async () => {
    await createHandler().handle(event)

    expect(revisionService.createRevision).toHaveBeenCalled()
  })

  it('should not create a revision for an item that does not exist', async () => {
    itemRepository.findByUuid = jest.fn().mockReturnValue(null)

    await createHandler().handle(event)

    expect(revisionService.createRevision).not.toHaveBeenCalled()
  })
})

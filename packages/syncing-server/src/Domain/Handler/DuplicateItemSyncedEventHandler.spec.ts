import 'reflect-metadata'

import {
  DomainEventPublisherInterface,
  DuplicateItemSyncedEvent,
  RevisionsCopyRequestedEvent,
} from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { Item } from '../Item/Item'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { DuplicateItemSyncedEventHandler } from './DuplicateItemSyncedEventHandler'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { Uuid, ContentType, Dates, Timestamps, UniqueEntityId } from '@standardnotes/domain-core'

describe('DuplicateItemSyncedEventHandler', () => {
  let itemRepository: ItemRepositoryInterface
  let logger: Logger
  let duplicateItem: Item
  let originalItem: Item
  let event: DuplicateItemSyncedEvent
  let domainEventFactory: DomainEventFactoryInterface
  let domainEventPublisher: DomainEventPublisherInterface

  const createHandler = () =>
    new DuplicateItemSyncedEventHandler(itemRepository, domainEventFactory, domainEventPublisher, logger)

  beforeEach(() => {
    originalItem = Item.create(
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

    duplicateItem = Item.create(
      {
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        updatedWithSession: null,
        content: 'foobar',
        contentType: ContentType.create(ContentType.TYPES.Note).getValue(),
        encItemKey: null,
        authHash: null,
        itemsKeyId: null,
        duplicateOf: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        deleted: false,
        dates: Dates.create(new Date(1616164633241311), new Date(1616164633241311)).getValue(),
        timestamps: Timestamps.create(1616164633241311, 1616164633241311).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000001'),
    ).getValue()

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findByUuidAndUserUuid = jest
      .fn()
      .mockReturnValueOnce(duplicateItem)
      .mockReturnValueOnce(originalItem)

    logger = {} as jest.Mocked<Logger>
    logger.warn = jest.fn()

    event = {} as jest.Mocked<DuplicateItemSyncedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      userUuid: '1-2-3',
      itemUuid: '2-3-4',
    }

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createRevisionsCopyRequestedEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<RevisionsCopyRequestedEvent>)

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()
  })

  it('should copy revisions from original item to the duplicate item', async () => {
    await createHandler().handle(event)

    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should not copy revisions if original item does not exist', async () => {
    itemRepository.findByUuidAndUserUuid = jest.fn().mockReturnValueOnce(duplicateItem).mockReturnValueOnce(null)

    await createHandler().handle(event)

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should not copy revisions if duplicate item does not exist', async () => {
    itemRepository.findByUuidAndUserUuid = jest.fn().mockReturnValueOnce(null).mockReturnValueOnce(originalItem)

    await createHandler().handle(event)

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should not copy revisions if duplicate item is not pointing to duplicate anything', async () => {
    duplicateItem.props.duplicateOf = null
    await createHandler().handle(event)

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })
})

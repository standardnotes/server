import 'reflect-metadata'

import { AccountDeletionRequestedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { Item } from '../Item/Item'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { AccountDeletionRequestedEventHandler } from './AccountDeletionRequestedEventHandler'
import { Uuid, ContentType, Dates, Timestamps, UniqueEntityId } from '@standardnotes/domain-core'
import { ItemRepositoryResolverInterface } from '../Item/ItemRepositoryResolverInterface'

describe('AccountDeletionRequestedEventHandler', () => {
  let itemRepositoryResolver: ItemRepositoryResolverInterface
  let itemRepository: ItemRepositoryInterface
  let logger: Logger
  let event: AccountDeletionRequestedEvent
  let item: Item

  const createHandler = () => new AccountDeletionRequestedEventHandler(itemRepositoryResolver, logger)

  beforeEach(() => {
    item = Item.create(
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

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findAll = jest.fn().mockReturnValue([item])
    itemRepository.deleteByUserUuid = jest.fn()

    itemRepositoryResolver = {} as jest.Mocked<ItemRepositoryResolverInterface>
    itemRepositoryResolver.resolve = jest.fn().mockReturnValue(itemRepository)

    logger = {} as jest.Mocked<Logger>
    logger.info = jest.fn()

    event = {} as jest.Mocked<AccountDeletionRequestedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      userUuid: '2-3-4',
      userCreatedAtTimestamp: 1,
      regularSubscriptionUuid: '1-2-3',
      roleNames: ['CORE_USER'],
    }
  })

  it('should remove all items for a user', async () => {
    await createHandler().handle(event)

    expect(itemRepository.deleteByUserUuid).toHaveBeenCalledWith('2-3-4')
  })

  it('should do nothing if role names are not valid', async () => {
    event.payload.roleNames = ['INVALID_ROLE_NAME']

    await createHandler().handle(event)

    expect(itemRepository.deleteByUserUuid).not.toHaveBeenCalled()
  })
})

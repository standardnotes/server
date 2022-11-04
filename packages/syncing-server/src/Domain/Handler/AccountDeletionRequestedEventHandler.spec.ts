import 'reflect-metadata'

import { AccountDeletionRequestedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { Item } from '../Item/Item'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { AccountDeletionRequestedEventHandler } from './AccountDeletionRequestedEventHandler'

describe('AccountDeletionRequestedEventHandler', () => {
  let itemRepository: ItemRepositoryInterface
  let logger: Logger
  let event: AccountDeletionRequestedEvent
  let item: Item

  const createHandler = () => new AccountDeletionRequestedEventHandler(itemRepository, logger)

  beforeEach(() => {
    item = {
      uuid: '1-2-3',
      content: 'test',
    } as jest.Mocked<Item>

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findAll = jest.fn().mockReturnValue([item])
    itemRepository.deleteByUserUuid = jest.fn()

    logger = {} as jest.Mocked<Logger>
    logger.info = jest.fn()

    event = {} as jest.Mocked<AccountDeletionRequestedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      userUuid: '2-3-4',
      userCreatedAtTimestamp: 1,
      regularSubscriptionUuid: '1-2-3',
    }
  })

  it('should remove all items and revision for a user', async () => {
    await createHandler().handle(event)

    expect(itemRepository.deleteByUserUuid).toHaveBeenCalledWith('2-3-4')
  })
})

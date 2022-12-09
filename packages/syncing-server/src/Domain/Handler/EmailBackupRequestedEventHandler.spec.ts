import 'reflect-metadata'

import {
  DomainEventPublisherInterface,
  EmailBackupRequestedEvent,
  EmailRequestedEvent,
} from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { AuthHttpServiceInterface } from '../Auth/AuthHttpServiceInterface'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { Item } from '../Item/Item'
import { ItemBackupServiceInterface } from '../Item/ItemBackupServiceInterface'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { EmailBackupRequestedEventHandler } from './EmailBackupRequestedEventHandler'
import { ItemTransferCalculatorInterface } from '../Item/ItemTransferCalculatorInterface'

describe('EmailBackupRequestedEventHandler', () => {
  let itemRepository: ItemRepositoryInterface
  let authHttpService: AuthHttpServiceInterface
  let itemBackupService: ItemBackupServiceInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  const emailAttachmentMaxByteSize = 100
  let itemTransferCalculator: ItemTransferCalculatorInterface
  let item: Item
  let event: EmailBackupRequestedEvent
  let logger: Logger

  const createHandler = () =>
    new EmailBackupRequestedEventHandler(
      itemRepository,
      authHttpService,
      itemBackupService,
      domainEventPublisher,
      domainEventFactory,
      emailAttachmentMaxByteSize,
      itemTransferCalculator,
      's3-backup-bucket-name',
      logger,
    )

  beforeEach(() => {
    item = {} as jest.Mocked<Item>

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findAll = jest.fn().mockReturnValue([item])

    authHttpService = {} as jest.Mocked<AuthHttpServiceInterface>
    authHttpService.getUserKeyParams = jest.fn().mockReturnValue({ identifier: 'test@test.com' })

    event = {} as jest.Mocked<EmailBackupRequestedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      userUuid: '1-2-3',
      userHasEmailsMuted: false,
      muteEmailsSettingUuid: '1-2-3',
    }

    itemBackupService = {} as jest.Mocked<ItemBackupServiceInterface>
    itemBackupService.backup = jest.fn().mockReturnValue('backup-file-name')

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createEmailRequestedEvent = jest.fn().mockReturnValue({} as jest.Mocked<EmailRequestedEvent>)

    itemTransferCalculator = {} as jest.Mocked<ItemTransferCalculatorInterface>
    itemTransferCalculator.computeItemUuidBundlesToFetch = jest.fn().mockReturnValue([['1-2-3']])

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.warn = jest.fn()
    logger.error = jest.fn()
  })

  it('should inform that backup attachment for email was created', async () => {
    await createHandler().handle(event)

    expect(domainEventPublisher.publish).toHaveBeenCalledTimes(1)
    expect(domainEventFactory.createEmailRequestedEvent).toHaveBeenCalled()
  })

  it('should inform that multipart backup attachment for email was created', async () => {
    itemBackupService.backup = jest
      .fn()
      .mockReturnValueOnce('backup-file-name-1')
      .mockReturnValueOnce('backup-file-name-2')
    itemTransferCalculator.computeItemUuidBundlesToFetch = jest.fn().mockReturnValue([['1-2-3'], ['2-3-4']])

    await createHandler().handle(event)

    expect(domainEventPublisher.publish).toHaveBeenCalledTimes(2)
    expect(domainEventFactory.createEmailRequestedEvent).toHaveBeenCalledTimes(2)
  })

  it('should not inform that backup attachment for email was created if user key params cannot be obtained', async () => {
    authHttpService.getUserKeyParams = jest.fn().mockImplementation(() => {
      throw new Error('Oops!')
    })

    await createHandler().handle(event)

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
    expect(domainEventFactory.createEmailRequestedEvent).not.toHaveBeenCalled()
  })

  it('should not inform that backup attachment for email was created if backup file name is empty', async () => {
    itemBackupService.backup = jest.fn().mockReturnValue('')

    await createHandler().handle(event)

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
    expect(domainEventFactory.createEmailRequestedEvent).not.toHaveBeenCalled()
  })
})

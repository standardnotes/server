import 'reflect-metadata'

import {
  DomainEventPublisherInterface,
  EmailBackupRequestedEvent,
  EmailBackupAttachmentCreatedEvent,
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
    domainEventFactory.createEmailBackupAttachmentCreatedEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<EmailBackupAttachmentCreatedEvent>)

    itemTransferCalculator = {} as jest.Mocked<ItemTransferCalculatorInterface>
    itemTransferCalculator.computeItemUuidBundlesToFetch = jest.fn().mockReturnValue([['1-2-3']])

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.warn = jest.fn()
  })

  it('should inform that backup attachment for email was created', async () => {
    await createHandler().handle(event)

    expect(domainEventPublisher.publish).toHaveBeenCalledTimes(1)
    expect(domainEventFactory.createEmailBackupAttachmentCreatedEvent).toHaveBeenCalledWith({
      backupFileIndex: 1,
      backupFileName: 'backup-file-name',
      backupFilesTotal: 1,
      email: 'test@test.com',
    })
  })

  it('should inform that multipart backup attachment for email was created', async () => {
    itemBackupService.backup = jest
      .fn()
      .mockReturnValueOnce('backup-file-name-1')
      .mockReturnValueOnce('backup-file-name-2')
    itemTransferCalculator.computeItemUuidBundlesToFetch = jest.fn().mockReturnValue([['1-2-3'], ['2-3-4']])

    await createHandler().handle(event)

    expect(domainEventPublisher.publish).toHaveBeenCalledTimes(2)
    expect(domainEventFactory.createEmailBackupAttachmentCreatedEvent).toHaveBeenNthCalledWith(1, {
      backupFileIndex: 1,
      backupFileName: 'backup-file-name-1',
      backupFilesTotal: 2,
      email: 'test@test.com',
    })
    expect(domainEventFactory.createEmailBackupAttachmentCreatedEvent).toHaveBeenNthCalledWith(2, {
      backupFileIndex: 2,
      backupFileName: 'backup-file-name-2',
      backupFilesTotal: 2,
      email: 'test@test.com',
    })
  })

  it('should not inform that backup attachment for email was created if user key params cannot be obtained', async () => {
    authHttpService.getUserKeyParams = jest.fn().mockImplementation(() => {
      throw new Error('Oops!')
    })

    await createHandler().handle(event)

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
    expect(domainEventFactory.createEmailBackupAttachmentCreatedEvent).not.toHaveBeenCalled()
  })

  it('should not inform that backup attachment for email was created if backup file name is empty', async () => {
    itemBackupService.backup = jest.fn().mockReturnValue('')

    await createHandler().handle(event)

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
    expect(domainEventFactory.createEmailBackupAttachmentCreatedEvent).not.toHaveBeenCalled()
  })
})

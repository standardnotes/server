import 'reflect-metadata'

import { KeyParamsData } from '@standardnotes/responses'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { ContentDecoderInterface } from '../Item/ContentDecoderInterface'
import { Item } from '../Item/Item'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { ExtensionsHttpService } from './ExtensionsHttpService'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { AxiosInstance } from 'axios'
import { Uuid, ContentType, Dates, Timestamps, UniqueEntityId } from '@standardnotes/domain-core'

describe('ExtensionsHttpService', () => {
  let httpClient: AxiosInstance
  let primaryItemRepository: ItemRepositoryInterface
  let secondaryItemRepository: ItemRepositoryInterface | null
  let contentDecoder: ContentDecoderInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  let item: Item
  let authParams: KeyParamsData
  let logger: Logger

  const createService = () =>
    new ExtensionsHttpService(
      httpClient,
      primaryItemRepository,
      secondaryItemRepository,
      contentDecoder,
      domainEventPublisher,
      domainEventFactory,
      logger,
    )

  beforeEach(() => {
    httpClient = {} as jest.Mocked<AxiosInstance>
    httpClient.request = jest.fn().mockReturnValue({ status: 200, data: { foo: 'bar' } })

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

    authParams = {} as jest.Mocked<KeyParamsData>

    primaryItemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    primaryItemRepository.findByUuidAndUserUuid = jest.fn().mockReturnValue(item)

    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createEmailRequestedEvent = jest.fn()

    contentDecoder = {} as jest.Mocked<ContentDecoderInterface>
    contentDecoder.decode = jest.fn().mockReturnValue({ name: 'Dropbox' })
  })

  it('should trigger cloud backup on extensions server', async () => {
    await createService().triggerCloudBackupOnExtensionsServer({
      userUuid: '1-2-3',
      extensionsServerUrl: 'https://extensions-server/extension1',
      forceMute: false,
      backupFilename: 'test',
      authParams,
      cloudProvider: 'DROPBOX',
    })

    expect(httpClient.request).toHaveBeenCalledWith({
      data: {
        auth_params: authParams,
        backup_filename: 'test',
        silent: false,
        user_uuid: '1-2-3',
      },
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      url: 'https://extensions-server/extension1',
      validateStatus: expect.any(Function),
    })
  })

  it('should publish a failed Dropbox backup event if request was not sent successfully', async () => {
    contentDecoder.decode = jest.fn().mockReturnValue({ name: 'Dropbox' })

    httpClient.request = jest.fn().mockImplementation(() => {
      throw new Error('Could not reach the extensions server')
    })

    await createService().triggerCloudBackupOnExtensionsServer({
      userUuid: '1-2-3',
      extensionsServerUrl: 'https://extensions-server/extension1',
      forceMute: false,
      backupFilename: 'test',
      authParams,
      cloudProvider: 'DROPBOX',
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createEmailRequestedEvent).toHaveBeenCalled()
  })

  it('should send items to extensions server', async () => {
    await createService().sendItemsToExtensionsServer({
      userUuid: '1-2-3',
      extensionId: '2-3-4',
      extensionsServerUrl: 'https://extensions-server/extension1',
      forceMute: false,
      items: [item],
      backupFilename: '',
      authParams,
    })

    expect(httpClient.request).toHaveBeenCalledWith({
      data: {
        auth_params: authParams,
        backup_filename: '',
        items: [item],
        silent: false,
        user_uuid: '1-2-3',
      },
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      url: 'https://extensions-server/extension1',
      validateStatus: expect.any(Function),
    })
  })

  it('should send items proxy backup file name only to extensions server', async () => {
    await createService().sendItemsToExtensionsServer({
      userUuid: '1-2-3',
      extensionId: '2-3-4',
      extensionsServerUrl: 'https://extensions-server/extension1',
      forceMute: false,
      backupFilename: 'backup-file',
      authParams,
    })

    expect(httpClient.request).toHaveBeenCalledWith({
      data: {
        auth_params: authParams,
        backup_filename: 'backup-file',
        silent: false,
        user_uuid: '1-2-3',
      },
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      url: 'https://extensions-server/extension1',
      validateStatus: expect.any(Function),
    })
  })

  it('should publish a failed Dropbox backup event if request was not sent successfully', async () => {
    contentDecoder.decode = jest.fn().mockReturnValue({ name: 'Dropbox' })

    httpClient.request = jest.fn().mockImplementation(() => {
      throw new Error('Could not reach the extensions server')
    })

    await createService().sendItemsToExtensionsServer({
      userUuid: '1-2-3',
      extensionId: '2-3-4',
      extensionsServerUrl: 'https://extensions-server/extension1',
      forceMute: false,
      items: [item],
      backupFilename: 'backup-file',
      authParams,
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createEmailRequestedEvent).toHaveBeenCalled()
  })

  it('should publish a failed backup event if the extension is in the secondary repository', async () => {
    primaryItemRepository.findByUuidAndUserUuid = jest.fn().mockReturnValue(null)
    secondaryItemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    secondaryItemRepository.findByUuidAndUserUuid = jest.fn().mockReturnValue(item)

    httpClient.request = jest.fn().mockImplementation(() => {
      throw new Error('Could not reach the extensions server')
    })

    await createService().sendItemsToExtensionsServer({
      userUuid: '1-2-3',
      extensionId: '2-3-4',
      extensionsServerUrl: '',
      forceMute: false,
      items: [item],
      backupFilename: 'backup-file',
      authParams,
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createEmailRequestedEvent).toHaveBeenCalled()

    secondaryItemRepository = null
  })

  it('should publish a failed Dropbox backup event if request was sent and extensions server responded not ok', async () => {
    contentDecoder.decode = jest.fn().mockReturnValue({ name: 'Dropbox' })

    httpClient.request = jest.fn().mockReturnValue({ status: 400, data: { error: 'foo-bar' } })

    await createService().sendItemsToExtensionsServer({
      userUuid: '1-2-3',
      extensionId: '2-3-4',
      extensionsServerUrl: 'https://extensions-server/extension1',
      forceMute: false,
      items: [item],
      backupFilename: 'backup-file',
      authParams,
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createEmailRequestedEvent).toHaveBeenCalled()
  })

  it('should publish a failed Google Drive backup event if request was not sent successfully', async () => {
    contentDecoder.decode = jest.fn().mockReturnValue({ name: 'Google Drive' })

    httpClient.request = jest.fn().mockImplementation(() => {
      throw new Error('Could not reach the extensions server')
    })

    await createService().sendItemsToExtensionsServer({
      userUuid: '1-2-3',
      extensionId: '2-3-4',
      extensionsServerUrl: 'https://extensions-server/extension1',
      forceMute: false,
      items: [item],
      backupFilename: 'backup-file',
      authParams,
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createEmailRequestedEvent).toHaveBeenCalled()
  })

  it('should publish a failed One Drive backup event if request was not sent successfully', async () => {
    contentDecoder.decode = jest.fn().mockReturnValue({ name: 'OneDrive' })

    httpClient.request = jest.fn().mockImplementation(() => {
      throw new Error('Could not reach the extensions server')
    })

    await createService().sendItemsToExtensionsServer({
      userUuid: '1-2-3',
      extensionId: '2-3-4',
      extensionsServerUrl: 'https://extensions-server/extension1',
      forceMute: false,
      items: [item],
      backupFilename: 'backup-file',
      authParams,
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createEmailRequestedEvent).toHaveBeenCalled()
  })

  it('should not publish a failed backup event if emailes are force muted', async () => {
    contentDecoder.decode = jest.fn().mockReturnValue({ name: 'OneDrive' })

    httpClient.request = jest.fn().mockImplementation(() => {
      throw new Error('Could not reach the extensions server')
    })

    await createService().sendItemsToExtensionsServer({
      userUuid: '1-2-3',
      extensionId: '2-3-4',
      extensionsServerUrl: 'https://extensions-server/extension1',
      forceMute: true,
      items: [item],
      backupFilename: 'backup-file',
      authParams,
    })

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should throw an error if the extension to post to is not found', async () => {
    primaryItemRepository.findByUuidAndUserUuid = jest.fn().mockReturnValue(null)

    httpClient.request = jest.fn().mockImplementation(() => {
      throw new Error('Could not reach the extensions server')
    })

    let error = null
    try {
      await createService().sendItemsToExtensionsServer({
        userUuid: '1-2-3',
        extensionId: '2-3-4',
        extensionsServerUrl: 'https://extensions-server/extension1',
        forceMute: false,
        items: [item],
        backupFilename: 'backup-file',
        authParams,
      })
    } catch (e) {
      error = e
    }

    expect(error).not.toBeNull()
  })

  it('should throw an error if the extension to post to has no content', async () => {
    item = {} as jest.Mocked<Item>
    primaryItemRepository.findByUuidAndUserUuid = jest.fn().mockReturnValue(item)

    httpClient.request = jest.fn().mockImplementation(() => {
      throw new Error('Could not reach the extensions server')
    })

    let error = null
    try {
      await createService().sendItemsToExtensionsServer({
        userUuid: '1-2-3',
        extensionId: '2-3-4',
        extensionsServerUrl: 'https://extensions-server/extension1',
        forceMute: false,
        items: [item],
        backupFilename: 'backup-file',
        authParams,
      })
    } catch (e) {
      error = e
    }

    expect(error).not.toBeNull()
  })

  it('should publish a failed Dropbox backup event judging by extension url if request was not sent successfully', async () => {
    contentDecoder.decode = jest.fn().mockReturnValue({ url: 'https://dbt.com/...' })

    httpClient.request = jest.fn().mockImplementation(() => {
      throw new Error('Could not reach the extensions server')
    })

    await createService().sendItemsToExtensionsServer({
      userUuid: '1-2-3',
      extensionId: '2-3-4',
      extensionsServerUrl: 'https://extensions-server/extension1',
      forceMute: false,
      items: [item],
      backupFilename: 'backup-file',
      authParams,
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createEmailRequestedEvent).toHaveBeenCalled()
  })

  it('should publish a failed Google Drive backup event judging by extension url if request was not sent successfully', async () => {
    contentDecoder.decode = jest.fn().mockReturnValue({ url: 'https://gdrive.com/...' })

    httpClient.request = jest.fn().mockImplementation(() => {
      throw new Error('Could not reach the extensions server')
    })

    await createService().sendItemsToExtensionsServer({
      userUuid: '1-2-3',
      extensionId: '2-3-4',
      extensionsServerUrl: 'https://extensions-server/extension1',
      forceMute: false,
      items: [item],
      backupFilename: 'backup-file',
      authParams,
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createEmailRequestedEvent).toHaveBeenCalled()
  })

  it('should publish a failed One Drive backup event judging by extension url if request was not sent successfully', async () => {
    contentDecoder.decode = jest.fn().mockReturnValue({ url: 'https://onedrive.com/...' })

    httpClient.request = jest.fn().mockImplementation(() => {
      throw new Error('Could not reach the extensions server')
    })

    await createService().sendItemsToExtensionsServer({
      userUuid: '1-2-3',
      extensionId: '2-3-4',
      extensionsServerUrl: 'https://extensions-server/extension1',
      forceMute: false,
      items: [item],
      backupFilename: 'backup-file',
      authParams,
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createEmailRequestedEvent).toHaveBeenCalled()
  })

  it('should throw an error if cannot deduce extension by judging from the url', async () => {
    contentDecoder.decode = jest.fn().mockReturnValue({ url: 'https://foobar.com/...' })

    httpClient.request = jest.fn().mockImplementation(() => {
      throw new Error('Could not reach the extensions server')
    })

    let error = null
    try {
      await createService().sendItemsToExtensionsServer({
        userUuid: '1-2-3',
        extensionId: '2-3-4',
        extensionsServerUrl: 'https://extensions-server/extension1',
        forceMute: false,
        items: [item],
        backupFilename: 'backup-file',
        authParams,
      })
    } catch (e) {
      error = e
    }

    expect(error).not.toBeNull()
  })

  it('should throw an error if there is no extension name or url', async () => {
    contentDecoder.decode = jest.fn().mockReturnValue({})

    httpClient.request = jest.fn().mockImplementation(() => {
      throw new Error('Could not reach the extensions server')
    })

    let error = null
    try {
      await createService().sendItemsToExtensionsServer({
        userUuid: '1-2-3',
        extensionId: '2-3-4',
        extensionsServerUrl: 'https://extensions-server/extension1',
        forceMute: false,
        items: [item],
        backupFilename: 'backup-file',
        authParams,
      })
    } catch (e) {
      error = e
    }

    expect(error).not.toBeNull()
  })
})

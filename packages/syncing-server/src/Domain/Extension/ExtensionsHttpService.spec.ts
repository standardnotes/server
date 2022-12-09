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

describe('ExtensionsHttpService', () => {
  let httpClient: AxiosInstance
  let itemRepository: ItemRepositoryInterface
  let contentDecoder: ContentDecoderInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  let item: Item
  let authParams: KeyParamsData
  let logger: Logger

  const createService = () =>
    new ExtensionsHttpService(
      httpClient,
      itemRepository,
      contentDecoder,
      domainEventPublisher,
      domainEventFactory,
      logger,
    )

  beforeEach(() => {
    httpClient = {} as jest.Mocked<AxiosInstance>
    httpClient.request = jest.fn().mockReturnValue({ status: 200, data: { foo: 'bar' } })

    item = {
      content: 'test',
    } as jest.Mocked<Item>

    authParams = {} as jest.Mocked<KeyParamsData>

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findByUuidAndUserUuid = jest.fn().mockReturnValue(item)

    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createDropboxBackupFailedEvent = jest.fn()
    domainEventFactory.createGoogleDriveBackupFailedEvent = jest.fn()
    domainEventFactory.createOneDriveBackupFailedEvent = jest.fn()
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
      muteEmailsSettingUuid: '3-4-5',
      cloudProvider: 'DROPBOX',
    })

    expect(httpClient.request).toHaveBeenCalledWith({
      data: {
        auth_params: authParams,
        backup_filename: 'test',
        settings_id: '3-4-5',
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
      muteEmailsSettingUuid: '3-4-5',
      cloudProvider: 'DROPBOX',
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createDropboxBackupFailedEvent).toHaveBeenCalled()
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
      muteEmailsSettingUuid: '3-4-5',
    })

    expect(httpClient.request).toHaveBeenCalledWith({
      data: {
        auth_params: authParams,
        backup_filename: '',
        items: [item],
        settings_id: '3-4-5',
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
      muteEmailsSettingUuid: '3-4-5',
    })

    expect(httpClient.request).toHaveBeenCalledWith({
      data: {
        auth_params: authParams,
        backup_filename: 'backup-file',
        settings_id: '3-4-5',
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
      muteEmailsSettingUuid: '3-4-5',
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createDropboxBackupFailedEvent).toHaveBeenCalled()
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
      muteEmailsSettingUuid: '3-4-5',
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createDropboxBackupFailedEvent).toHaveBeenCalled()
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
      muteEmailsSettingUuid: '3-4-5',
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createGoogleDriveBackupFailedEvent).toHaveBeenCalled()
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
      muteEmailsSettingUuid: '3-4-5',
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createOneDriveBackupFailedEvent).toHaveBeenCalled()
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
      muteEmailsSettingUuid: '3-4-5',
    })

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should throw an error if the extension to post to is not found', async () => {
    itemRepository.findByUuidAndUserUuid = jest.fn().mockReturnValue(null)

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
        muteEmailsSettingUuid: '3-4-5',
      })
    } catch (e) {
      error = e
    }

    expect(error).not.toBeNull()
  })

  it('should throw an error if the extension to post to has no content', async () => {
    item = {} as jest.Mocked<Item>
    itemRepository.findByUuidAndUserUuid = jest.fn().mockReturnValue(item)

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
        muteEmailsSettingUuid: '3-4-5',
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
      muteEmailsSettingUuid: '3-4-5',
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createDropboxBackupFailedEvent).toHaveBeenCalled()
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
      muteEmailsSettingUuid: '3-4-5',
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createGoogleDriveBackupFailedEvent).toHaveBeenCalled()
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
      muteEmailsSettingUuid: '3-4-5',
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
    expect(domainEventFactory.createOneDriveBackupFailedEvent).toHaveBeenCalled()
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
        muteEmailsSettingUuid: '3-4-5',
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
        muteEmailsSettingUuid: '3-4-5',
      })
    } catch (e) {
      error = e
    }

    expect(error).not.toBeNull()
  })
})

import 'reflect-metadata'

import { CloudBackupRequestedEvent } from '@standardnotes/domain-events'
import { AuthHttpServiceInterface } from '../Auth/AuthHttpServiceInterface'
import { Item } from '../Item/Item'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { CloudBackupRequestedEventHandler } from './CloudBackupRequestedEventHandler'
import { ItemBackupServiceInterface } from '../Item/ItemBackupServiceInterface'
import { ExtensionsHttpServiceInterface } from '../Extension/ExtensionsHttpServiceInterface'
import { Logger } from 'winston'

describe('CloudBackupRequestedEventHandler', () => {
  let itemRepository: ItemRepositoryInterface
  let authHttpService: AuthHttpServiceInterface
  let extensionsHttpService: ExtensionsHttpServiceInterface
  let itemBackupService: ItemBackupServiceInterface
  const extensionsServerUrl = 'https://extensions-server'
  let event: CloudBackupRequestedEvent
  let item: Item
  let logger: Logger

  const createHandler = () =>
    new CloudBackupRequestedEventHandler(
      itemRepository,
      authHttpService,
      extensionsHttpService,
      itemBackupService,
      extensionsServerUrl,
      logger,
    )

  beforeEach(() => {
    item = {} as jest.Mocked<Item>

    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findAll = jest.fn().mockReturnValue([item])

    authHttpService = {} as jest.Mocked<AuthHttpServiceInterface>
    authHttpService.getUserKeyParams = jest.fn().mockReturnValue({ foo: 'bar' })

    extensionsHttpService = {} as jest.Mocked<ExtensionsHttpServiceInterface>
    extensionsHttpService.triggerCloudBackupOnExtensionsServer = jest.fn()

    event = {} as jest.Mocked<CloudBackupRequestedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      cloudProvider: 'DROPBOX',
      cloudProviderToken: 'test-token',
      userUuid: '1-2-3',
      muteEmailsSettingUuid: '2-3-4',
      userHasEmailsMuted: false,
    }

    itemBackupService = {} as jest.Mocked<ItemBackupServiceInterface>
    itemBackupService.backup = jest.fn().mockReturnValue(['backup-file-name'])

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.warn = jest.fn()
  })

  it('should trigger cloud backup on extensions server - dropbox', async () => {
    await createHandler().handle(event)

    expect(itemRepository.findAll).toHaveBeenCalledWith({
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
      userUuid: '1-2-3',
      deleted: false,
    })

    expect(extensionsHttpService.triggerCloudBackupOnExtensionsServer).toHaveBeenCalledWith({
      authParams: {
        foo: 'bar',
      },
      backupFilename: 'backup-file-name',
      cloudProvider: 'DROPBOX',
      extensionsServerUrl: 'https://extensions-server/dropbox/items/sync?type=sf&dbt=test-token',
      muteEmailsSettingUuid: '2-3-4',
      forceMute: false,
      userUuid: '1-2-3',
    })
  })

  it('should trigger cloud backup on extensions server - google drive', async () => {
    event.payload.cloudProvider = 'GOOGLE_DRIVE'

    await createHandler().handle(event)

    expect(extensionsHttpService.triggerCloudBackupOnExtensionsServer).toHaveBeenCalledWith({
      authParams: {
        foo: 'bar',
      },
      backupFilename: 'backup-file-name',
      cloudProvider: 'GOOGLE_DRIVE',
      extensionsServerUrl: 'https://extensions-server/gdrive/sync?key=test-token',
      muteEmailsSettingUuid: '2-3-4',
      forceMute: false,
      userUuid: '1-2-3',
    })
  })

  it('should trigger cloud backup on extensions server - one drive', async () => {
    event.payload.cloudProvider = 'ONE_DRIVE'

    await createHandler().handle(event)

    expect(extensionsHttpService.triggerCloudBackupOnExtensionsServer).toHaveBeenCalledWith({
      authParams: {
        foo: 'bar',
      },
      backupFilename: 'backup-file-name',
      cloudProvider: 'ONE_DRIVE',
      extensionsServerUrl: 'https://extensions-server/onedrive/sync?type=sf&key=test-token',
      muteEmailsSettingUuid: '2-3-4',
      forceMute: false,
      userUuid: '1-2-3',
    })
  })

  it('should not trigger cloud backup on extensions server - unknown', async () => {
    event.payload.cloudProvider = 'test' as 'DROPBOX' | 'GOOGLE_DRIVE' | 'ONE_DRIVE'

    let expectedError = null
    try {
      await createHandler().handle(event)
    } catch (error) {
      expectedError = error
    }

    expect(extensionsHttpService.triggerCloudBackupOnExtensionsServer).not.toHaveBeenCalled()
    expect(expectedError).not.toBeNull()
  })

  it('should not trigger cloud backup if backup filename is not returned', async () => {
    itemBackupService.backup = jest.fn().mockReturnValue([])

    await createHandler().handle(event)

    expect(extensionsHttpService.triggerCloudBackupOnExtensionsServer).not.toHaveBeenCalled()
  })

  it('should trigger cloud backup on extensions server with muted emails', async () => {
    event.payload.userHasEmailsMuted = true

    await createHandler().handle(event)

    expect(itemRepository.findAll).toHaveBeenCalledWith({
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
      userUuid: '1-2-3',
      deleted: false,
    })

    expect(extensionsHttpService.triggerCloudBackupOnExtensionsServer).toHaveBeenCalledWith({
      authParams: {
        foo: 'bar',
      },
      backupFilename: 'backup-file-name',
      cloudProvider: 'DROPBOX',
      extensionsServerUrl: 'https://extensions-server/dropbox/items/sync?type=sf&dbt=test-token',
      muteEmailsSettingUuid: '2-3-4',
      forceMute: true,
      userUuid: '1-2-3',
    })
  })

  it('should skip triggering cloud backups on extensions server if user key params cannot be obtained', async () => {
    authHttpService.getUserKeyParams = jest.fn().mockImplementation(() => {
      throw new Error('Oops!')
    })

    await createHandler().handle(event)

    expect(extensionsHttpService.triggerCloudBackupOnExtensionsServer).not.toHaveBeenCalled()
  })
})

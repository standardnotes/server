import 'reflect-metadata'

import { TimerInterface } from '@standardnotes/time'

import { DomainEventFactory } from './DomainEventFactory'

describe('DomainEventFactory', () => {
  let timer: TimerInterface

  const createFactory = () => new DomainEventFactory(timer)

  beforeEach(() => {
    timer = {} as jest.Mocked<TimerInterface>
    timer.getUTCDate = jest.fn().mockReturnValue(new Date(1))
  })

  it('should create a ITEMS_SYNCED event', () => {
    expect(
      createFactory().createItemsSyncedEvent({
        userUuid: '1-2-3',
        extensionUrl: 'https://test.com',
        extensionId: '2-3-4',
        itemUuids: ['3-4-5'],
        forceMute: false,
        skipFileBackup: false,
        source: 'realtime-extensions-sync',
      }),
    ).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: '1-2-3',
          userIdentifierType: 'uuid',
        },
        origin: 'syncing-server',
      },
      payload: {
        userUuid: '1-2-3',
        extensionUrl: 'https://test.com',
        extensionId: '2-3-4',
        itemUuids: ['3-4-5'],
        forceMute: false,
        skipFileBackup: false,
        source: 'realtime-extensions-sync',
      },
      type: 'ITEMS_SYNCED',
    })
  })

  it('should create a DROPBOX_BACKUP_FAILED event', () => {
    expect(createFactory().createDropboxBackupFailedEvent('1-2-3', 'test@test.com')).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: 'test@test.com',
          userIdentifierType: 'email',
        },
        origin: 'syncing-server',
      },
      payload: {
        email: 'test@test.com',
        muteCloudEmailsSettingUuid: '1-2-3',
      },
      type: 'DROPBOX_BACKUP_FAILED',
    })
  })

  it('should create a GOOGLE_DRIVE_BACKUP_FAILED event', () => {
    expect(createFactory().createGoogleDriveBackupFailedEvent('1-2-3', 'test@test.com')).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: 'test@test.com',
          userIdentifierType: 'email',
        },
        origin: 'syncing-server',
      },
      payload: {
        email: 'test@test.com',
        muteCloudEmailsSettingUuid: '1-2-3',
      },
      type: 'GOOGLE_DRIVE_BACKUP_FAILED',
    })
  })

  it('should create a ONE_DRIVE_BACKUP_FAILED event', () => {
    expect(createFactory().createOneDriveBackupFailedEvent('1-2-3', 'test@test.com')).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: 'test@test.com',
          userIdentifierType: 'email',
        },
        origin: 'syncing-server',
      },
      payload: {
        email: 'test@test.com',
        muteCloudEmailsSettingUuid: '1-2-3',
      },
      type: 'ONE_DRIVE_BACKUP_FAILED',
    })
  })

  it('should create a EMAIL_ARCHIVE_EXTENSION_SYNCED event', () => {
    expect(createFactory().createEmailArchiveExtensionSyncedEvent('1-2-3', '2-3-4')).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: '1-2-3',
          userIdentifierType: 'uuid',
        },
        origin: 'syncing-server',
      },
      payload: {
        userUuid: '1-2-3',
        extensionId: '2-3-4',
      },
      type: 'EMAIL_ARCHIVE_EXTENSION_SYNCED',
    })
  })

  it('should create a EMAIL_BACKUP_ATTACHMENT_CREATED event', () => {
    expect(
      createFactory().createEmailBackupAttachmentCreatedEvent({
        backupFileName: 'backup-file',
        email: 'test@test.com',
        backupFileIndex: 1,
        backupFilesTotal: 2,
      }),
    ).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: 'test@test.com',
          userIdentifierType: 'email',
        },
        origin: 'syncing-server',
      },
      payload: {
        backupFileName: 'backup-file',
        email: 'test@test.com',
        backupFileIndex: 1,
        backupFilesTotal: 2,
      },
      type: 'EMAIL_BACKUP_ATTACHMENT_CREATED',
    })
  })

  it('should create a DUPLICATE_ITEM_SYNCED event', () => {
    expect(createFactory().createDuplicateItemSyncedEvent('1-2-3', '2-3-4')).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: '2-3-4',
          userIdentifierType: 'uuid',
        },
        origin: 'syncing-server',
      },
      payload: {
        itemUuid: '1-2-3',
        userUuid: '2-3-4',
      },
      type: 'DUPLICATE_ITEM_SYNCED',
    })
  })
})

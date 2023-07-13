import 'reflect-metadata'

import {
  DomainEventPublisherInterface,
  FileUploadedEvent,
  SharedVaultFileUploadedEvent,
} from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { FileUploaderInterface } from '../../Services/FileUploaderInterface'
import { UploadRepositoryInterface } from '../../Upload/UploadRepositoryInterface'

import { FinishUploadSession } from './FinishUploadSession'

describe('FinishUploadSession', () => {
  let fileUploader: FileUploaderInterface
  let uploadRepository: UploadRepositoryInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  let logger: Logger

  const createUseCase = () =>
    new FinishUploadSession(fileUploader, uploadRepository, domainEventPublisher, domainEventFactory, logger)

  beforeEach(() => {
    fileUploader = {} as jest.Mocked<FileUploaderInterface>
    fileUploader.finishUploadSession = jest.fn().mockReturnValue('ETag123')

    uploadRepository = {} as jest.Mocked<UploadRepositoryInterface>
    uploadRepository.retrieveUploadSessionId = jest.fn().mockReturnValue('123')
    uploadRepository.retrieveUploadChunkResults = jest.fn().mockReturnValue([{ tag: '123', chunkId: 1, chunkSize: 1 }])

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createFileUploadedEvent = jest.fn().mockReturnValue({} as jest.Mocked<FileUploadedEvent>)
    domainEventFactory.createSharedVaultFileUploadedEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<SharedVaultFileUploadedEvent>)

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.error = jest.fn()
    logger.warn = jest.fn()
  })

  it('should not finish an upload session if non existing', async () => {
    uploadRepository.retrieveUploadSessionId = jest.fn().mockReturnValue(undefined)

    await createUseCase().execute({
      resourceRemoteIdentifier: '2-3-4',
      ownerUuid: '1-2-3',
      ownerType: 'user',
      uploadBytesLimit: 100,
      uploadBytesUsed: 0,
    })

    expect(fileUploader.finishUploadSession).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should indicate of an error in finishing session fails', async () => {
    uploadRepository.retrieveUploadSessionId = jest.fn().mockImplementation(() => {
      throw new Error('oops')
    })

    expect(
      await createUseCase().execute({
        resourceRemoteIdentifier: '2-3-4',
        ownerUuid: '1-2-3',
        ownerType: 'user',
        uploadBytesLimit: 100,
        uploadBytesUsed: 0,
      }),
    ).toEqual({
      success: false,
      message: 'Could not finish upload session',
    })

    expect(fileUploader.finishUploadSession).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should finish an upload session', async () => {
    await createUseCase().execute({
      resourceRemoteIdentifier: '2-3-4',
      ownerUuid: '1-2-3',
      ownerType: 'user',
      uploadBytesLimit: 100,
      uploadBytesUsed: 0,
    })

    expect(fileUploader.finishUploadSession).toHaveBeenCalledWith('123', '1-2-3/2-3-4', [
      { tag: '123', chunkId: 1, chunkSize: 1 },
    ])
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should finish an upload session for a vault shared file', async () => {
    await createUseCase().execute({
      resourceRemoteIdentifier: '2-3-4',
      ownerUuid: '1-2-3',
      ownerType: 'shared-vault',
      uploadBytesLimit: 100,
      uploadBytesUsed: 0,
    })

    expect(fileUploader.finishUploadSession).toHaveBeenCalledWith('123', '1-2-3/2-3-4', [
      { tag: '123', chunkId: 1, chunkSize: 1 },
    ])
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should not finish an upload session if the file size exceeds storage quota', async () => {
    uploadRepository.retrieveUploadChunkResults = jest.fn().mockReturnValue([
      { tag: '123', chunkId: 1, chunkSize: 60 },
      { tag: '234', chunkId: 2, chunkSize: 10 },
      { tag: '345', chunkId: 3, chunkSize: 20 },
    ])

    expect(
      await createUseCase().execute({
        resourceRemoteIdentifier: '2-3-4',
        ownerUuid: '1-2-3',
        ownerType: 'user',
        uploadBytesLimit: 100,
        uploadBytesUsed: 20,
      }),
    ).toEqual({
      success: false,
      message: 'Could not finish upload session. You are out of space.',
    })

    expect(fileUploader.finishUploadSession).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should ignore the storage quota if user has unlimited storage', async () => {
    uploadRepository.retrieveUploadChunkResults = jest.fn().mockReturnValue([
      { tag: '123', chunkId: 1, chunkSize: 60 },
      { tag: '234', chunkId: 2, chunkSize: 10 },
      { tag: '345', chunkId: 3, chunkSize: 20 },
    ])

    expect(
      await createUseCase().execute({
        resourceRemoteIdentifier: '2-3-4',
        ownerUuid: '1-2-3',
        ownerType: 'user',
        uploadBytesLimit: -1,
        uploadBytesUsed: 20,
      }),
    ).toEqual({
      success: true,
    })

    expect(fileUploader.finishUploadSession).toHaveBeenCalled()
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })
})

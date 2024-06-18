import {
  DomainEventPublisherInterface,
  FileUploadedEvent,
  SharedVaultFileUploadedEvent,
} from '@standardnotes/domain-events'

import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { FileUploaderInterface } from '../../Services/FileUploaderInterface'
import { UploadRepositoryInterface } from '../../Upload/UploadRepositoryInterface'

import { FinishUploadSession } from './FinishUploadSession'
import { ValetTokenRepositoryInterface } from '../../ValetToken/ValetTokenRepositoryInterface'

describe('FinishUploadSession', () => {
  let fileUploader: FileUploaderInterface
  let uploadRepository: UploadRepositoryInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  let valetTokenRepository: ValetTokenRepositoryInterface

  const createUseCase = () =>
    new FinishUploadSession(
      fileUploader,
      uploadRepository,
      domainEventPublisher,
      domainEventFactory,
      valetTokenRepository,
    )

  beforeEach(() => {
    valetTokenRepository = {} as jest.Mocked<ValetTokenRepositoryInterface>
    valetTokenRepository.markAsUsed = jest.fn()

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
  })

  it('should not finish an upload session if non existing', async () => {
    uploadRepository.retrieveUploadSessionId = jest.fn().mockReturnValue(undefined)

    await createUseCase().execute({
      resourceRemoteIdentifier: '2-3-4',
      userUuid: '00000000-0000-0000-0000-000000000000',
      uploadBytesLimit: 100,
      uploadBytesUsed: 0,
      valetToken: 'valet-token',
    })

    expect(fileUploader.finishUploadSession).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should not finish an upload session user uuid is invalid', async () => {
    const result = await createUseCase().execute({
      resourceRemoteIdentifier: '2-3-4',
      userUuid: 'invalid',
      uploadBytesLimit: 100,
      uploadBytesUsed: 0,
      valetToken: 'valet-token',
    })

    expect(result.isFailed()).toBeTruthy()
    expect(fileUploader.finishUploadSession).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should indicate of an error in finishing session fails', async () => {
    uploadRepository.retrieveUploadSessionId = jest.fn().mockImplementation(() => {
      throw new Error('oops')
    })

    const result = await createUseCase().execute({
      resourceRemoteIdentifier: '2-3-4',
      userUuid: '00000000-0000-0000-0000-000000000000',
      uploadBytesLimit: 100,
      uploadBytesUsed: 0,
      valetToken: 'valet-token',
    })

    expect(result.getError()).toEqual('Could not finish upload session')

    expect(fileUploader.finishUploadSession).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should finish an upload session', async () => {
    await createUseCase().execute({
      resourceRemoteIdentifier: '2-3-4',
      userUuid: '00000000-0000-0000-0000-000000000000',
      uploadBytesLimit: 100,
      uploadBytesUsed: 0,
      valetToken: 'valet-token',
    })

    expect(fileUploader.finishUploadSession).toHaveBeenCalledWith('123', '00000000-0000-0000-0000-000000000000/2-3-4', [
      { tag: '123', chunkId: 1, chunkSize: 1 },
    ])
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should finish an upload session for a vault shared file', async () => {
    await createUseCase().execute({
      resourceRemoteIdentifier: '2-3-4',
      userUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      uploadBytesLimit: 100,
      uploadBytesUsed: 0,
      valetToken: 'valet-token',
    })

    expect(fileUploader.finishUploadSession).toHaveBeenCalledWith('123', '00000000-0000-0000-0000-000000000000/2-3-4', [
      { tag: '123', chunkId: 1, chunkSize: 1 },
    ])
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should not finish an upload session for a vault shared file if shared vault uuid is invalid', async () => {
    const result = await createUseCase().execute({
      resourceRemoteIdentifier: '2-3-4',
      userUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: 'invalid',
      uploadBytesLimit: 100,
      uploadBytesUsed: 0,
      valetToken: 'valet-token',
    })

    expect(result.isFailed()).toBeTruthy()
    expect(fileUploader.finishUploadSession).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should not finish an upload session if the file size exceeds storage quota', async () => {
    uploadRepository.retrieveUploadChunkResults = jest.fn().mockReturnValue([
      { tag: '123', chunkId: 1, chunkSize: 60 },
      { tag: '234', chunkId: 2, chunkSize: 10 },
      { tag: '345', chunkId: 3, chunkSize: 20 },
    ])

    const result = await createUseCase().execute({
      resourceRemoteIdentifier: '2-3-4',
      userUuid: '00000000-0000-0000-0000-000000000000',
      uploadBytesLimit: 100,
      uploadBytesUsed: 20,
      valetToken: 'valet-token',
    })
    expect(result.getError()).toEqual('Could not finish upload session. You are out of space.')

    expect(fileUploader.finishUploadSession).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should ignore the storage quota if user has unlimited storage', async () => {
    uploadRepository.retrieveUploadChunkResults = jest.fn().mockReturnValue([
      { tag: '123', chunkId: 1, chunkSize: 60 },
      { tag: '234', chunkId: 2, chunkSize: 10 },
      { tag: '345', chunkId: 3, chunkSize: 20 },
    ])

    const result = await createUseCase().execute({
      resourceRemoteIdentifier: '2-3-4',
      userUuid: '00000000-0000-0000-0000-000000000000',
      uploadBytesLimit: -1,
      uploadBytesUsed: 20,
      valetToken: 'valet-token',
    })
    expect(result.isFailed()).toBeFalsy()

    expect(fileUploader.finishUploadSession).toHaveBeenCalled()
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })
})

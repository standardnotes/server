import 'reflect-metadata'
import { Logger } from 'winston'
import { FileUploaderInterface } from '../../Services/FileUploaderInterface'
import { UploadRepositoryInterface } from '../../Upload/UploadRepositoryInterface'

import { UploadFileChunk } from './UploadFileChunk'

describe('UploadFileChunk', () => {
  let fileUploader: FileUploaderInterface
  let uploadRepository: UploadRepositoryInterface
  let logger: Logger

  const createUseCase = () => new UploadFileChunk(fileUploader, uploadRepository, logger)

  beforeEach(() => {
    fileUploader = {} as jest.Mocked<FileUploaderInterface>
    fileUploader.uploadFileChunk = jest.fn().mockReturnValue('ETag123')

    uploadRepository = {} as jest.Mocked<UploadRepositoryInterface>
    uploadRepository.retrieveUploadSessionId = jest.fn().mockReturnValue('123')
    uploadRepository.storeUploadChunkResult = jest.fn()

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.error = jest.fn()
    logger.warn = jest.fn()
  })

  it('should not upload a data chunk with 0 bytes', async () => {
    expect(
      await createUseCase().execute({
        chunkId: 2,
        data: new Uint8Array([]),
        resourceRemoteIdentifier: '2-3-4',
        resourceUnencryptedFileSize: 123,
        ownerUuid: '1-2-3',
      }),
    ).toEqual({
      success: false,
      message: 'Empty file chunk',
    })

    expect(fileUploader.uploadFileChunk).not.toHaveBeenCalled()
    expect(uploadRepository.storeUploadChunkResult).not.toHaveBeenCalled()
  })

  it('should not upload a data chunk to a non existing file upload session', async () => {
    uploadRepository.retrieveUploadSessionId = jest.fn().mockReturnValue(undefined)

    await createUseCase().execute({
      chunkId: 2,
      data: new Uint8Array([123]),
      resourceRemoteIdentifier: '2-3-4',
      resourceUnencryptedFileSize: 123,
      ownerUuid: '1-2-3',
    })

    expect(fileUploader.uploadFileChunk).not.toHaveBeenCalled()
    expect(uploadRepository.storeUploadChunkResult).not.toHaveBeenCalled()
  })

  it('should indicate of an error in uploading the chunk', async () => {
    uploadRepository.retrieveUploadSessionId = jest.fn().mockImplementation(() => {
      throw new Error('oops')
    })

    expect(
      await createUseCase().execute({
        chunkId: 2,
        data: new Uint8Array([123]),
        resourceRemoteIdentifier: '2-3-4',
        resourceUnencryptedFileSize: 123,
        ownerUuid: '1-2-3',
      }),
    ).toEqual({
      success: false,
      message: 'Could not upload file chunk',
    })

    expect(fileUploader.uploadFileChunk).not.toHaveBeenCalled()
    expect(uploadRepository.storeUploadChunkResult).not.toHaveBeenCalled()
  })

  it('should upload a data chunk to an existing file upload session', async () => {
    await createUseCase().execute({
      chunkId: 2,
      data: new Uint8Array([123]),
      resourceRemoteIdentifier: '2-3-4',
      resourceUnencryptedFileSize: 123,
      ownerUuid: '1-2-3',
    })

    expect(fileUploader.uploadFileChunk).toHaveBeenCalledWith({
      chunkId: 2,
      data: new Uint8Array([123]),
      filePath: '1-2-3/2-3-4',
      uploadId: '123',
      unencryptedFileSize: 123,
    })
    expect(uploadRepository.storeUploadChunkResult).toHaveBeenCalledWith('123', {
      tag: 'ETag123',
      chunkId: 2,
      chunkSize: 1,
    })
  })
})

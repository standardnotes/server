import 'reflect-metadata'
import { Logger } from 'winston'
import { FileUploaderInterface } from '../../Services/FileUploaderInterface'
import { UploadRepositoryInterface } from '../../Upload/UploadRepositoryInterface'

import { CreateUploadSession } from './CreateUploadSession'

describe('CreateUploadSession', () => {
  let fileUploader: FileUploaderInterface
  let uploadRepository: UploadRepositoryInterface
  let logger: Logger

  const createUseCase = () => new CreateUploadSession(fileUploader, uploadRepository, logger)

  beforeEach(() => {
    fileUploader = {} as jest.Mocked<FileUploaderInterface>
    fileUploader.createUploadSession = jest.fn().mockReturnValue('123')

    uploadRepository = {} as jest.Mocked<UploadRepositoryInterface>
    uploadRepository.storeUploadSession = jest.fn()

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.error = jest.fn()
    logger.warn = jest.fn()
  })

  it('should indicate of an error in creating the upload session', async () => {
    uploadRepository.storeUploadSession = jest.fn().mockImplementation(() => {
      throw new Error('oops')
    })

    expect(
      await createUseCase().execute({
        resourceRemoteIdentifier: '2-3-4',
        ownerUuid: '1-2-3',
      }),
    ).toEqual({
      success: false,
      message: 'Could not create upload session',
    })
  })

  it('should create an upload session', async () => {
    await createUseCase().execute({
      resourceRemoteIdentifier: '2-3-4',
      ownerUuid: '1-2-3',
    })

    expect(fileUploader.createUploadSession).toHaveBeenCalledWith('1-2-3/2-3-4')
    expect(uploadRepository.storeUploadSession).toHaveBeenCalledWith('1-2-3/2-3-4', '123')
  })
})

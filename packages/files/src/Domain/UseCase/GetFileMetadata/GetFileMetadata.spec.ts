import 'reflect-metadata'
import { Logger } from 'winston'
import { FileDownloaderInterface } from '../../Services/FileDownloaderInterface'

import { GetFileMetadata } from './GetFileMetadata'

describe('GetFileMetadata', () => {
  let fileDownloader: FileDownloaderInterface
  let logger: Logger

  const createUseCase = () => new GetFileMetadata(fileDownloader, logger)

  beforeEach(() => {
    fileDownloader = {} as jest.Mocked<FileDownloaderInterface>
    fileDownloader.getFileSize = jest.fn().mockReturnValue(123)

    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()
  })

  it('should return the file metadata', async () => {
    expect(await createUseCase().execute({ resourceRemoteIdentifier: '1-2-3', userUuid: '2-3-4' })).toEqual({
      success: true,
      size: 123,
    })
  })

  it('should not return the file metadata if it fails', async () => {
    fileDownloader.getFileSize = jest.fn().mockImplementation(() => {
      throw new Error('ooops')
    })

    expect(await createUseCase().execute({ resourceRemoteIdentifier: '1-2-3', userUuid: '2-3-4' })).toEqual({
      success: false,
      message: 'Could not get file metadata.',
    })
  })
})

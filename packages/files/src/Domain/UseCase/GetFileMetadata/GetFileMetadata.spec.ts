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
    const result = await createUseCase().execute({ resourceRemoteIdentifier: '1-2-3', ownerUuid: '2-3-4' })
    expect(result.getValue()).toEqual(123)
  })

  it('should not return the file metadata if it fails', async () => {
    fileDownloader.getFileSize = jest.fn().mockImplementation(() => {
      throw new Error('ooops')
    })

    const result = await createUseCase().execute({ resourceRemoteIdentifier: '1-2-3', ownerUuid: '2-3-4' })

    expect(result.isFailed()).toBe(true)
  })
})

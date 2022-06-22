import 'reflect-metadata'

import { Readable } from 'stream'
import { Logger } from 'winston'
import { FileDownloaderInterface } from '../../Services/FileDownloaderInterface'

import { StreamDownloadFile } from './StreamDownloadFile'

describe('StreamDownloadFile', () => {
  let fileDownloader: FileDownloaderInterface
  let logger: Logger

  const createUseCase = () => new StreamDownloadFile(fileDownloader, logger)

  beforeEach(() => {
    fileDownloader = {} as jest.Mocked<FileDownloaderInterface>
    fileDownloader.createDownloadStream = jest.fn().mockReturnValue(new Readable())

    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()
  })

  it('should stream download file contents from S3', async () => {
    const result = await createUseCase().execute({
      userUuid: '2-3-4',
      resourceRemoteIdentifier: '1-2-3',
      startRange: 0,
      endRange: 200,
    })

    expect(result.success).toBeTruthy()
  })

  it('should not stream download file contents from S3 if it fails', async () => {
    fileDownloader.createDownloadStream = jest.fn().mockImplementation(() => {
      throw new Error('oops')
    })

    const result = await createUseCase().execute({
      userUuid: '2-3-4',
      resourceRemoteIdentifier: '1-2-3',
      startRange: 0,
      endRange: 200,
    })

    expect(result.success).toBeFalsy()
  })
})

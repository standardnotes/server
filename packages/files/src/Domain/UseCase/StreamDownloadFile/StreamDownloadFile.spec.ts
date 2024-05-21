import 'reflect-metadata'

import { Readable } from 'stream'
import { Logger } from 'winston'
import { FileDownloaderInterface } from '../../Services/FileDownloaderInterface'

import { StreamDownloadFile } from './StreamDownloadFile'
import { ValetTokenRepositoryInterface } from '../../ValetToken/ValetTokenRepositoryInterface'

describe('StreamDownloadFile', () => {
  let fileDownloader: FileDownloaderInterface
  let logger: Logger
  const valetToken = 'valet-token'
  let valetTokenRepository: ValetTokenRepositoryInterface

  const createUseCase = () => new StreamDownloadFile(fileDownloader, valetTokenRepository, logger)

  beforeEach(() => {
    valetTokenRepository = {} as jest.Mocked<ValetTokenRepositoryInterface>
    valetTokenRepository.markAsUsed = jest.fn()

    fileDownloader = {} as jest.Mocked<FileDownloaderInterface>
    fileDownloader.createDownloadStream = jest.fn().mockReturnValue(new Readable())

    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()
  })

  it('should stream download file contents from S3', async () => {
    const result = await createUseCase().execute({
      ownerUuid: '2-3-4',
      resourceRemoteIdentifier: '1-2-3',
      startRange: 0,
      endRange: 200,
      endRangeOfFile: 300,
      valetToken,
    })

    expect(result.success).toBeTruthy()
  })

  it('should mark valet token as used if the last chunk is being streamed', async () => {
    const result = await createUseCase().execute({
      ownerUuid: '2-3-4',
      resourceRemoteIdentifier: '1-2-3',
      startRange: 0,
      endRange: 200,
      endRangeOfFile: 200,
      valetToken,
    })

    expect(result.success).toBeTruthy()

    expect(valetTokenRepository.markAsUsed).toHaveBeenCalledWith(valetToken)
  })

  it('should not stream download file contents from S3 if it fails', async () => {
    fileDownloader.createDownloadStream = jest.fn().mockImplementation(() => {
      throw new Error('oops')
    })

    const result = await createUseCase().execute({
      ownerUuid: '2-3-4',
      resourceRemoteIdentifier: '1-2-3',
      startRange: 0,
      endRange: 200,
      endRangeOfFile: 200,
      valetToken,
    })

    expect(result.success).toBeFalsy()
  })
})

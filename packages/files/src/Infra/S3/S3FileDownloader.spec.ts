import 'reflect-metadata'

import * as AWS from 'aws-sdk'
import { Readable } from 'stream'

import { S3FileDownloader } from './S3FileDownloader'

describe('S3FileDownloader', () => {
  let s3Client: AWS.S3
  const s3BuckeName = 'test'

  const createService = () => new S3FileDownloader(s3Client, s3BuckeName)

  beforeEach(() => {
    const awsRequest = {} as jest.Mocked<AWS.Request<AWS.S3.Types.GetObjectOutput, AWS.AWSError>>
    awsRequest.createReadStream = jest.fn().mockReturnValue(new Readable())

    s3Client = {} as jest.Mocked<AWS.S3>
    s3Client.getObject = jest.fn().mockReturnValue(awsRequest)

    const headRequest = {} as jest.Mocked<AWS.Request<AWS.S3.Types.HeadObjectOutput, AWS.AWSError>>
    headRequest.promise = jest.fn().mockReturnValue(Promise.resolve({ ContentLength: 200 }))
    s3Client.headObject = jest.fn().mockReturnValue(headRequest)
  })

  it('should create a download stream', () => {
    expect(createService().createDownloadStream('test.txt', 0, 200)).toBeInstanceOf(Readable)
  })

  it('should get file size', async () => {
    expect(await createService().getFileSize('test.txt')).toEqual(200)
  })
})

import 'reflect-metadata'
import * as AWS from 'aws-sdk'

import { S3FileUploader } from './S3FileUploader'

describe('S3FileUploader', () => {
  let s3Client: AWS.S3
  const s3BuckeName = 'test-bucket'

  const createUploader = () => new S3FileUploader(s3Client, s3BuckeName)

  beforeEach(() => {
    s3Client = {} as jest.Mocked<AWS.S3>
    s3Client.createMultipartUpload = jest.fn().mockReturnValue({
      promise: jest.fn().mockReturnValue({ UploadId: '1-2-3' }),
    })
    s3Client.uploadPart = jest.fn().mockReturnValue({
      promise: jest.fn().mockReturnValue({ ETag: '1-2-3' }),
    })
    s3Client.completeMultipartUpload = jest.fn().mockReturnValue({
      promise: jest.fn().mockReturnValue(true),
    })
  })

  it('should create an upload session', async () => {
    await createUploader().createUploadSession('1-2-3/2-3-4')

    expect(s3Client.createMultipartUpload).toHaveBeenCalledWith({
      ACL: 'private',
      Bucket: 'test-bucket',
      Key: '1-2-3/2-3-4',
      StorageClass: 'INTELLIGENT_TIERING',
    })
  })

  it('should finish an upload session', async () => {
    await createUploader().finishUploadSession('123', '1-2-3/2-3-4', [{ chunkId: 1, tag: '123123', chunkSize: 100 }])

    expect(s3Client.completeMultipartUpload).toHaveBeenCalledWith({
      Bucket: 'test-bucket',
      Key: '1-2-3/2-3-4',
      MultipartUpload: {
        Parts: [
          {
            ETag: '123123',
            PartNumber: 1,
          },
        ],
      },
      UploadId: '123',
    })
  })

  it('should upload a data chunk to an upload session', async () => {
    await createUploader().uploadFileChunk({
      chunkId: 1,
      data: new Uint8Array([123]),
      filePath: '1-2-3/2-3-4',
      uploadId: '123',
    })

    expect(s3Client.uploadPart).toHaveBeenCalledWith({
      Body: new Uint8Array([123]),
      Bucket: 'test-bucket',
      Key: '1-2-3/2-3-4',
      PartNumber: 1,
      UploadId: '123',
    })
  })
})

import 'reflect-metadata'

import * as AWS from 'aws-sdk'

import { S3FileRemover } from './S3FileRemover'

describe('S3FileRemover', () => {
  let s3Client: AWS.S3
  const s3BuckeName = 'test'

  const createService = () => new S3FileRemover(s3Client, s3BuckeName)

  beforeEach(() => {
    const deleteObjectRequest = {} as jest.Mocked<AWS.Request<AWS.S3.Types.DeleteObjectRequest, AWS.AWSError>>
    deleteObjectRequest.promise = jest.fn()

    s3Client = {} as jest.Mocked<AWS.S3>
    s3Client.deleteObject = jest.fn().mockReturnValue(deleteObjectRequest)

    const headRequest = {} as jest.Mocked<AWS.Request<AWS.S3.Types.HeadObjectOutput, AWS.AWSError>>
    headRequest.promise = jest.fn().mockReturnValue(Promise.resolve({ ContentLength: 200 }))
    s3Client.headObject = jest.fn().mockReturnValue(headRequest)
  })

  it('should delete a file', async () => {
    expect(await createService().remove('123/234')).toEqual(200)

    expect(s3Client.deleteObject).toHaveBeenCalledWith({
      Bucket: 'test',
      Key: '123/234',
    })
  })

  it('should mark user files for removal', async () => {
    const copyObjectRequest = {} as jest.Mocked<AWS.Request<AWS.S3.Types.CopyObjectRequest, AWS.AWSError>>
    copyObjectRequest.promise = jest.fn()

    s3Client.copyObject = jest.fn().mockReturnValue(copyObjectRequest)

    const listObjectsRequest = {} as jest.Mocked<AWS.Request<AWS.S3.Types.ListObjectsV2Request, AWS.AWSError>>
    listObjectsRequest.promise = jest.fn().mockReturnValue({
      Contents: [
        {
          Key: '123/2-3-4',
          Size: 123,
        },
        {
          Key: '123/3-4-5',
          Size: 234,
        },
        {},
      ],
    } as jest.Mocked<AWS.S3.ListObjectsV2Output>)

    s3Client.listObjectsV2 = jest.fn().mockReturnValue(listObjectsRequest)

    expect(await createService().markFilesToBeRemoved('123')).toEqual([
      {
        fileByteSize: 123,
        fileName: '2-3-4',
        filePath: '123/2-3-4',
        userUuid: '123',
      },
      {
        fileByteSize: 234,
        fileName: '3-4-5',
        filePath: '123/3-4-5',
        userUuid: '123',
      },
    ])

    expect(s3Client.copyObject).toHaveBeenCalledTimes(2)
    expect(s3Client.copyObject).toHaveBeenNthCalledWith(1, {
      Bucket: 'test',
      CopySource: 'test/123/2-3-4',
      Key: 'expiration-chamber/123/2-3-4',
      StorageClass: 'DEEP_ARCHIVE',
    })
    expect(s3Client.copyObject).toHaveBeenNthCalledWith(2, {
      Bucket: 'test',
      CopySource: 'test/123/3-4-5',
      Key: 'expiration-chamber/123/3-4-5',
      StorageClass: 'DEEP_ARCHIVE',
    })

    expect(s3Client.deleteObject).toHaveBeenCalledTimes(2)
    expect(s3Client.deleteObject).toHaveBeenNthCalledWith(1, {
      Bucket: 'test',
      Key: '123/2-3-4',
    })
    expect(s3Client.deleteObject).toHaveBeenNthCalledWith(2, {
      Bucket: 'test',
      Key: '123/3-4-5',
    })
  })

  it('should not mark user files for removal if there none', async () => {
    const copyObjectRequest = {} as jest.Mocked<AWS.Request<AWS.S3.Types.CopyObjectRequest, AWS.AWSError>>
    copyObjectRequest.promise = jest.fn()

    s3Client.copyObject = jest.fn().mockReturnValue(copyObjectRequest)

    const listObjectsRequest = {} as jest.Mocked<AWS.Request<AWS.S3.Types.ListObjectsV2Request, AWS.AWSError>>
    listObjectsRequest.promise = jest.fn().mockReturnValue({} as jest.Mocked<AWS.S3.ListObjectsV2Output>)

    s3Client.listObjectsV2 = jest.fn().mockReturnValue(listObjectsRequest)

    expect(await createService().markFilesToBeRemoved('123')).toEqual([])

    expect(s3Client.copyObject).not.toHaveBeenCalled()
    expect(s3Client.deleteObject).not.toHaveBeenCalled()
  })
})

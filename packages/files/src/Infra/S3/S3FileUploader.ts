import { inject, injectable } from 'inversify'
import * as AWS from 'aws-sdk'
import TYPES from '../../Bootstrap/Types'
import { FileUploaderInterface } from '../../Domain/Services/FileUploaderInterface'
import { UploadId } from '../../Domain/Upload/UploadId'
import { UploadChunkResult } from '../../Domain/Upload/UploadChunkResult'
import { ChunkId } from '../../Domain/Upload/ChunkId'

@injectable()
export class S3FileUploader implements FileUploaderInterface {
  constructor(@inject(TYPES.S3) private s3Client: AWS.S3, @inject(TYPES.S3_BUCKET_NAME) private s3BuckeName: string) {}

  async createUploadSession(filePath: string): Promise<UploadId> {
    const uploadSessionCreationResult = await this.s3Client
      .createMultipartUpload({
        Bucket: this.s3BuckeName,
        Key: filePath,
        ACL: 'private',
        StorageClass: 'INTELLIGENT_TIERING',
      })
      .promise()

    return uploadSessionCreationResult.UploadId as string
  }

  async uploadFileChunk(dto: {
    uploadId: string
    data: Uint8Array
    filePath: string
    chunkId: ChunkId
  }): Promise<string> {
    const uploadResult = await this.s3Client
      .uploadPart({
        Body: dto.data,
        Bucket: this.s3BuckeName,
        Key: dto.filePath,
        PartNumber: dto.chunkId,
        UploadId: dto.uploadId,
      })
      .promise()

    return uploadResult.ETag as string
  }

  async finishUploadSession(
    uploadId: string,
    filePath: string,
    uploadChunkResults: UploadChunkResult[],
  ): Promise<void> {
    const multipartUploadParts = uploadChunkResults.map((uploadChunkResult) => ({
      ETag: uploadChunkResult.tag,
      PartNumber: uploadChunkResult.chunkId,
    }))

    await this.s3Client
      .completeMultipartUpload({
        Bucket: this.s3BuckeName,
        Key: filePath,
        MultipartUpload: {
          Parts: multipartUploadParts,
        },
        UploadId: uploadId,
      })
      .promise()
  }
}

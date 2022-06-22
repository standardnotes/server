import { inject, injectable } from 'inversify'
import * as AWS from 'aws-sdk'
import { Readable } from 'stream'

import TYPES from '../../Bootstrap/Types'
import { FileDownloaderInterface } from '../../Domain/Services/FileDownloaderInterface'

@injectable()
export class S3FileDownloader implements FileDownloaderInterface {
  constructor(@inject(TYPES.S3) private s3Client: AWS.S3, @inject(TYPES.S3_BUCKET_NAME) private s3BuckeName: string) {}

  createDownloadStream(filePath: string, startRange: number, endRange: number): Readable {
    return this.s3Client
      .getObject({
        Bucket: this.s3BuckeName,
        Key: filePath,
        Range: `bytes=${startRange}-${endRange}`,
      })
      .createReadStream()
  }

  async getFileSize(filePath: string): Promise<number> {
    const head = await this.s3Client
      .headObject({
        Bucket: this.s3BuckeName,
        Key: filePath,
      })
      .promise()

    return head.ContentLength as number
  }
}

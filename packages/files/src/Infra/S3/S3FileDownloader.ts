import { GetObjectCommand, HeadObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { inject, injectable } from 'inversify'
import { Readable } from 'stream'

import TYPES from '../../Bootstrap/Types'
import { FileDownloaderInterface } from '../../Domain/Services/FileDownloaderInterface'

@injectable()
export class S3FileDownloader implements FileDownloaderInterface {
  constructor(
    @inject(TYPES.Files_S3) private s3Client: S3Client,
    @inject(TYPES.Files_S3_BUCKET_NAME) private s3BuckeName: string,
  ) {}

  async createDownloadStream(filePath: string, startRange: number, endRange: number): Promise<Readable> {
    const commandResult = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.s3BuckeName,
        Key: filePath,
        Range: `bytes=${startRange}-${endRange}`,
      }),
    )

    return commandResult.Body as Readable
  }

  async getFileSize(filePath: string): Promise<number> {
    const head = await this.s3Client.send(
      new HeadObjectCommand({
        Bucket: this.s3BuckeName,
        Key: filePath,
      }),
    )

    return head.ContentLength as number
  }
}

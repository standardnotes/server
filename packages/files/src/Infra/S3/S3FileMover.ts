import { inject, injectable } from 'inversify'
import { CopyObjectCommand, DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'

import TYPES from '../../Bootstrap/Types'
import { FileMoverInterface } from '../../Domain/Services/FileMoverInterface'

@injectable()
export class S3FileMover implements FileMoverInterface {
  constructor(
    @inject(TYPES.Files_S3) private s3Client: S3Client,
    @inject(TYPES.Files_S3_BUCKET_NAME) private s3BucketName: string,
  ) {}

  async moveFile(sourcePath: string, destinationPath: string): Promise<void> {
    await this.s3Client.send(
      new CopyObjectCommand({
        Bucket: this.s3BucketName,
        CopySource: `${this.s3BucketName}/${sourcePath}`,
        Key: destinationPath,
      }),
    )

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.s3BucketName,
        Key: sourcePath,
      }),
    )
  }
}

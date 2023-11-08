import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { Result } from '@standardnotes/domain-core'

import { CSVFileReaderInterface } from '../../Domain/CSV/CSVFileReaderInterface'

export class S3CsvFileReader implements CSVFileReaderInterface {
  constructor(
    private s3BucketName: string,
    private s3Client: S3Client,
  ) {}

  async getValues(fileName: string): Promise<Result<string[]>> {
    if (this.s3BucketName.length === 0) {
      return Result.fail('S3 bucket name is not set')
    }

    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.s3BucketName,
        Key: fileName,
      }),
    )

    if (response.Body === undefined) {
      return Result.fail(`Could not find CSV file at path: ${fileName}`)
    }

    const csvContent = await response.Body.transformToString()

    return Result.ok(csvContent.split('\n').filter((line) => line.length > 0))
  }
}

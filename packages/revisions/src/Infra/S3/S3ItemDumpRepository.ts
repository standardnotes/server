import { MapperInterface } from '@standardnotes/domain-core'
import { S3 } from 'aws-sdk'

import { DumpRepositoryInterface } from '../../Domain/Dump/DumpRepositoryInterface'
import { Revision } from '../../Domain/Revision/Revision'

export class S3DumpRepository implements DumpRepositoryInterface {
  constructor(
    private dumpBucketName: string,
    private s3Client: S3,
    private revisionStringItemMapper: MapperInterface<Revision, string>,
  ) {}

  async getRevisionFromDumpPath(path: string): Promise<Revision | null> {
    const s3Object = await this.s3Client
      .getObject({
        Bucket: this.dumpBucketName,
        Key: path,
      })
      .promise()

    if (s3Object.Body === undefined) {
      return null
    }

    const revision = this.revisionStringItemMapper.toDomain(s3Object.Body as string)

    return revision
  }

  async removeDump(path: string): Promise<void> {
    await this.s3Client
      .deleteObject({
        Bucket: this.dumpBucketName,
        Key: path,
      })
      .promise()
  }
}

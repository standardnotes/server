import { DeleteObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { MapperInterface } from '@standardnotes/domain-core'

import { DumpRepositoryInterface } from '../../Domain/Dump/DumpRepositoryInterface'
import { Revision } from '../../Domain/Revision/Revision'

export class S3DumpRepository implements DumpRepositoryInterface {
  constructor(
    private dumpBucketName: string,
    private s3Client: S3Client,
    private revisionStringItemMapper: MapperInterface<Revision, string>,
  ) {}

  async getRevisionFromDumpPath(path: string): Promise<Revision | null> {
    const s3Object = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.dumpBucketName,
        Key: path,
      }),
    )

    if (s3Object.Body === undefined) {
      return null
    }

    const revision = this.revisionStringItemMapper.toDomain(await s3Object.Body.transformToString())

    return revision
  }

  async removeDump(path: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.dumpBucketName,
        Key: path,
      }),
    )
  }
}

import { DeleteObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { MapperInterface, Result } from '@standardnotes/domain-core'

import { DumpRepositoryInterface } from '../../Domain/Dump/DumpRepositoryInterface'
import { Revision } from '../../Domain/Revision/Revision'

export class S3DumpRepository implements DumpRepositoryInterface {
  constructor(
    private dumpBucketName: string,
    private s3Client: S3Client,
    private revisionStringItemMapper: MapperInterface<Revision, string>,
  ) {}

  async getRevisionFromDumpPath(path: string): Promise<Result<Revision>> {
    try {
      const s3Object = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.dumpBucketName,
          Key: path,
        }),
      )

      if (s3Object.Body === undefined) {
        return Result.fail(`Could not find revision dump at path: ${path}`)
      }

      const revision = this.revisionStringItemMapper.toDomain(await s3Object.Body.transformToString())

      return Result.ok(revision)
    } catch (error) {
      return Result.fail(`Failed to read dump file: ${(error as Error).message}`)
    }
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

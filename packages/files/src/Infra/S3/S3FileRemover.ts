import { inject, injectable } from 'inversify'
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3'

import TYPES from '../../Bootstrap/Types'
import { FileRemoverInterface } from '../../Domain/Services/FileRemoverInterface'
import { RemovedFileDescription } from '../../Domain/File/RemovedFileDescription'

@injectable()
export class S3FileRemover implements FileRemoverInterface {
  constructor(
    @inject(TYPES.Files_S3) private s3Client: S3Client,
    @inject(TYPES.Files_S3_BUCKET_NAME) private s3BuckeName: string,
  ) {}

  async markFilesToBeRemoved(userUuid: string): Promise<Array<RemovedFileDescription>> {
    const filesResponse = await this.s3Client.send(
      new ListObjectsV2Command({
        Bucket: this.s3BuckeName,
        Prefix: `${userUuid}/`,
      }),
    )

    if (filesResponse.Contents === undefined) {
      return []
    }

    const files = filesResponse.Contents

    const removedFileDescriptions: Array<RemovedFileDescription> = []

    for (const file of files) {
      if (file.Key === undefined) {
        continue
      }

      await this.s3Client.send(
        new CopyObjectCommand({
          Bucket: this.s3BuckeName,
          Key: `expiration-chamber/${file.Key}`,
          CopySource: `${this.s3BuckeName}/${file.Key}`,
          StorageClass: 'DEEP_ARCHIVE',
        }),
      )

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.s3BuckeName,
          Key: file.Key,
        }),
      )

      removedFileDescriptions.push({
        fileByteSize: file.Size as number,
        fileName: file.Key.replace(`${userUuid}/`, ''),
        filePath: file.Key,
        userOrSharedVaultUuid: userUuid,
      })
    }

    return removedFileDescriptions
  }

  async remove(filePath: string): Promise<number> {
    const head = await this.s3Client.send(
      new HeadObjectCommand({
        Bucket: this.s3BuckeName,
        Key: filePath,
      }),
    )

    const fileSize = head.ContentLength as number

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.s3BuckeName,
        Key: filePath,
      }),
    )

    return fileSize
  }
}

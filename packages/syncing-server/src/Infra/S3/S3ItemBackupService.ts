import * as uuid from 'uuid'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { KeyParamsData } from '@standardnotes/responses'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { Item } from '../../Domain/Item/Item'
import { ItemBackupServiceInterface } from '../../Domain/Item/ItemBackupServiceInterface'
import { ProjectorInterface } from '../../Projection/ProjectorInterface'
import { ItemProjection } from '../../Projection/ItemProjection'

@injectable()
export class S3ItemBackupService implements ItemBackupServiceInterface {
  constructor(
    @inject(TYPES.S3_BACKUP_BUCKET_NAME) private s3BackupBucketName: string,
    @inject(TYPES.ItemProjector) private itemProjector: ProjectorInterface<Item, ItemProjection>,
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.S3) private s3Client?: S3Client,
  ) {}

  async dump(item: Item): Promise<string> {
    if (!this.s3BackupBucketName || this.s3Client === undefined) {
      this.logger.warn('S3 backup not configured')

      return ''
    }

    const s3Key = uuid.v4()
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.s3BackupBucketName,
        Key: s3Key,
        Body: JSON.stringify({
          item: await this.itemProjector.projectCustom('dump', item),
        }),
      }),
    )

    return s3Key
  }

  async backup(items: Item[], authParams: KeyParamsData): Promise<string> {
    if (!this.s3BackupBucketName || this.s3Client === undefined) {
      this.logger.warn('S3 backup not configured')

      return ''
    }

    const fileName = uuid.v4()

    const itemProjections = []
    for (const item of items) {
      itemProjections.push(await this.itemProjector.projectFull(item))
    }

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.s3BackupBucketName,
        Key: fileName,
        Body: JSON.stringify({
          items: itemProjections,
          auth_params: authParams,
        }),
      }),
    )

    return fileName
  }
}

import * as uuid from 'uuid'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { KeyParamsData } from '@standardnotes/responses'
import { Logger } from 'winston'

import { Item } from '../../Domain/Item/Item'
import { ItemBackupServiceInterface } from '../../Domain/Item/ItemBackupServiceInterface'
import { MapperInterface } from '@standardnotes/domain-core'
import { ItemBackupRepresentation } from '../../Mapping/Backup/ItemBackupRepresentation'
import { ItemHttpRepresentation } from '../../Mapping/Http/ItemHttpRepresentation'

export class S3ItemBackupService implements ItemBackupServiceInterface {
  constructor(
    private s3BackupBucketName: string,
    private backupMapper: MapperInterface<Item, ItemBackupRepresentation>,
    private httpMapper: MapperInterface<Item, ItemHttpRepresentation>,
    private logger: Logger,
    private s3Client?: S3Client,
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
          item: this.backupMapper.toProjection(item),
        }),
      }),
    )

    return s3Key
  }

  async backup(items: Item[], authParams: KeyParamsData, contentSizeLimit?: number): Promise<string[]> {
    if (!this.s3BackupBucketName || this.s3Client === undefined) {
      this.logger.warn('S3 backup not configured')

      return []
    }

    const fileNames = []
    let itemProjections: Array<ItemHttpRepresentation> = []
    let contentSizeCounter = 0
    for (const item of items) {
      const itemProjection = this.httpMapper.toProjection(item)

      if (contentSizeLimit === undefined) {
        itemProjections.push(itemProjection)

        continue
      }

      const itemContentSize = Buffer.byteLength(JSON.stringify(itemProjection))

      if (contentSizeCounter + itemContentSize <= contentSizeLimit) {
        itemProjections.push(itemProjection)

        contentSizeCounter += itemContentSize
      } else {
        const backupFileName = await this.createBackupFile(itemProjections, authParams)
        fileNames.push(backupFileName)

        itemProjections = [itemProjection]
        contentSizeCounter = itemContentSize
      }
    }

    if (itemProjections.length > 0) {
      const backupFileName = await this.createBackupFile(itemProjections, authParams)
      fileNames.push(backupFileName)
    }

    return fileNames
  }

  private async createBackupFile(
    itemRepresentations: ItemHttpRepresentation[],
    authParams: KeyParamsData,
  ): Promise<string> {
    const fileName = uuid.v4()

    await (this.s3Client as S3Client).send(
      new PutObjectCommand({
        Bucket: this.s3BackupBucketName,
        Key: fileName,
        Body: JSON.stringify({
          items: itemRepresentations,
          auth_params: authParams,
        }),
      }),
    )

    return fileName
  }
}

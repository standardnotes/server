import 'reflect-metadata'

import { KeyParamsData } from '@standardnotes/responses'
import { S3 } from 'aws-sdk'
import { Logger } from 'winston'
import { Item } from '../../Domain/Item/Item'
import { S3ItemBackupService } from './S3ItemBackupService'
import { ProjectorInterface } from '../../Projection/ProjectorInterface'
import { ItemProjection } from '../../Projection/ItemProjection'

describe('S3ItemBackupService', () => {
  let s3Client: S3 | undefined
  let itemProjector: ProjectorInterface<Item, ItemProjection>
  let s3BackupBucketName = 'backup-bucket'
  let logger: Logger
  let item: Item
  let keyParams: KeyParamsData

  const createService = () => new S3ItemBackupService(s3BackupBucketName, itemProjector, logger, s3Client)

  beforeEach(() => {
    s3Client = {} as jest.Mocked<S3>
    s3Client.upload = jest.fn().mockReturnValue({
      promise: jest.fn().mockReturnValue(Promise.resolve({ Key: 'test' })),
    })

    logger = {} as jest.Mocked<Logger>
    logger.warn = jest.fn()

    item = {} as jest.Mocked<Item>

    keyParams = {} as jest.Mocked<KeyParamsData>

    itemProjector = {} as jest.Mocked<ProjectorInterface<Item, ItemProjection>>
    itemProjector.projectFull = jest.fn().mockReturnValue({ foo: 'bar' })
  })

  it('should upload items to S3 as a backup file', async () => {
    await createService().backup([item], keyParams)

    expect((<S3>s3Client).upload).toHaveBeenCalledWith({
      Body: '{"items":[{"foo":"bar"}],"auth_params":{}}',
      Bucket: 'backup-bucket',
      Key: expect.any(String),
    })
  })

  it('should not upload items to S3 if bucket name is not configured', async () => {
    s3BackupBucketName = ''
    await createService().backup([item], keyParams)

    expect((<S3>s3Client).upload).not.toHaveBeenCalled()
  })

  it('should not upload items to S3 if S3 client is not configured', async () => {
    s3Client = undefined
    expect(await createService().backup([item], keyParams)).toEqual('')
  })
})

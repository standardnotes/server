import { KeyParamsData } from '@standardnotes/responses'
import {
  DomainEventHandlerInterface,
  DomainEventPublisherInterface,
  EmailBackupRequestedEvent,
} from '@standardnotes/domain-events'
import { EmailLevel } from '@standardnotes/domain-core'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { AuthHttpServiceInterface } from '../Auth/AuthHttpServiceInterface'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { ItemBackupServiceInterface } from '../Item/ItemBackupServiceInterface'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { ItemTransferCalculatorInterface } from '../Item/ItemTransferCalculatorInterface'
import { ItemQuery } from '../Item/ItemQuery'
import { getBody, getSubject } from '../Email/EmailBackupAttachmentCreated'

@injectable()
export class EmailBackupRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.ItemRepository) private itemRepository: ItemRepositoryInterface,
    @inject(TYPES.AuthHttpService) private authHttpService: AuthHttpServiceInterface,
    @inject(TYPES.ItemBackupService) private itemBackupService: ItemBackupServiceInterface,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.EMAIL_ATTACHMENT_MAX_BYTE_SIZE) private emailAttachmentMaxByteSize: number,
    @inject(TYPES.ItemTransferCalculator) private itemTransferCalculator: ItemTransferCalculatorInterface,
    @inject(TYPES.S3_BACKUP_BUCKET_NAME) private s3BackupBucketName: string,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async handle(event: EmailBackupRequestedEvent): Promise<void> {
    let authParams: KeyParamsData
    try {
      authParams = await this.authHttpService.getUserKeyParams({
        uuid: event.payload.userUuid,
        authenticated: false,
      })
    } catch (error) {
      this.logger.warn(`Could not get user key params from auth service: ${(error as Error).message}`)

      return
    }

    const itemQuery: ItemQuery = {
      userUuid: event.payload.userUuid,
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
      deleted: false,
    }
    const itemUuidBundles = await this.itemTransferCalculator.computeItemUuidBundlesToFetch(
      itemQuery,
      this.emailAttachmentMaxByteSize,
    )

    let bundleIndex = 1
    for (const itemUuidBundle of itemUuidBundles) {
      const items = await this.itemRepository.findAll({
        uuids: itemUuidBundle,
        sortBy: 'updated_at_timestamp',
        sortOrder: 'ASC',
      })

      const backupFileName = await this.itemBackupService.backup(items, authParams)

      this.logger.debug(`Data backed up into: ${backupFileName}`)

      if (backupFileName.length === 0) {
        this.logger.error(`Could not create a backup file for user ${event.payload.userUuid}`)

        return
      }
      const dateOnly = new Date().toISOString().substring(0, 10)

      await this.domainEventPublisher.publish(
        this.domainEventFactory.createEmailRequestedEvent({
          body: getBody(authParams.identifier as string),
          level: EmailLevel.LEVELS.System,
          messageIdentifier: 'DATA_BACKUP',
          subject: getSubject(bundleIndex++, itemUuidBundles.length, dateOnly),
          userEmail: authParams.identifier as string,
          sender: 'backups@standardnotes.org',
          attachments: [
            {
              fileName: backupFileName,
              filePath: this.s3BackupBucketName,
              attachmentFileName: `SN-Data-${dateOnly}.txt`,
              attachmentContentType: 'application/json',
            },
          ],
        }),
      )
    }
  }
}

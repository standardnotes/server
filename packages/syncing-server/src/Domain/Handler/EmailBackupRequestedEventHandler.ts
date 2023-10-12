import {
  DomainEventHandlerInterface,
  DomainEventPublisherInterface,
  EmailBackupRequestedEvent,
} from '@standardnotes/domain-events'
import { EmailLevel } from '@standardnotes/domain-core'
import { Logger } from 'winston'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { ItemBackupServiceInterface } from '../Item/ItemBackupServiceInterface'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { ItemTransferCalculatorInterface } from '../Item/ItemTransferCalculatorInterface'
import { ItemQuery } from '../Item/ItemQuery'
import { getBody, getSubject } from '../Email/EmailBackupAttachmentCreated'

export class EmailBackupRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private primaryItemRepository: ItemRepositoryInterface,
    private secondaryItemRepository: ItemRepositoryInterface | null,
    private itemBackupService: ItemBackupServiceInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private emailAttachmentMaxByteSize: number,
    private itemTransferCalculator: ItemTransferCalculatorInterface,
    private s3BackupBucketName: string,
    private logger: Logger,
  ) {}

  async handle(event: EmailBackupRequestedEvent): Promise<void> {
    await this.requestEmailWithBackupFile(event, this.primaryItemRepository)

    if (this.secondaryItemRepository) {
      await this.requestEmailWithBackupFile(event, this.secondaryItemRepository)
    }
  }

  private async requestEmailWithBackupFile(
    event: EmailBackupRequestedEvent,
    itemRepository: ItemRepositoryInterface,
  ): Promise<void> {
    const itemQuery: ItemQuery = {
      userUuid: event.payload.userUuid,
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
      deleted: false,
    }
    const itemContentSizeDescriptors = await itemRepository.findContentSizeForComputingTransferLimit(itemQuery)
    const itemUuidBundles = await this.itemTransferCalculator.computeItemUuidBundlesToFetch(
      itemContentSizeDescriptors,
      this.emailAttachmentMaxByteSize,
    )

    const backupFileNames: string[] = []
    for (const itemUuidBundle of itemUuidBundles) {
      const items = await itemRepository.findAll({
        uuids: itemUuidBundle,
        sortBy: 'updated_at_timestamp',
        sortOrder: 'ASC',
      })

      const bundleBackupFileNames = await this.itemBackupService.backup(
        items,
        event.payload.keyParams,
        this.emailAttachmentMaxByteSize,
      )

      backupFileNames.push(...bundleBackupFileNames)
    }

    const dateOnly = new Date().toISOString().substring(0, 10)
    let bundleIndex = 1

    for (const backupFileName of backupFileNames) {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createEmailRequestedEvent({
          body: getBody(event.payload.keyParams.identifier as string),
          level: EmailLevel.LEVELS.System,
          messageIdentifier: 'DATA_BACKUP',
          subject: getSubject(bundleIndex++, backupFileNames.length, dateOnly),
          userEmail: event.payload.keyParams.identifier as string,
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

    this.logger.info(`Email with backup requested for user ${event.payload.userUuid}`)
  }
}

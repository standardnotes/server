import { KeyParamsData } from '@standardnotes/responses'
import {
  DomainEventHandlerInterface,
  DomainEventPublisherInterface,
  EmailArchiveExtensionSyncedEvent,
} from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { AuthHttpServiceInterface } from '../Auth/AuthHttpServiceInterface'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { ItemBackupServiceInterface } from '../Item/ItemBackupServiceInterface'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { ItemQuery } from '../Item/ItemQuery'
import { ItemTransferCalculatorInterface } from '../Item/ItemTransferCalculatorInterface'

@injectable()
export class EmailArchiveExtensionSyncedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.ItemRepository) private itemRepository: ItemRepositoryInterface,
    @inject(TYPES.AuthHttpService) private authHttpService: AuthHttpServiceInterface,
    @inject(TYPES.ItemBackupService) private itemBackupService: ItemBackupServiceInterface,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.EMAIL_ATTACHMENT_MAX_BYTE_SIZE) private emailAttachmentMaxByteSize: number,
    @inject(TYPES.ItemTransferCalculator) private itemTransferCalculator: ItemTransferCalculatorInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async handle(event: EmailArchiveExtensionSyncedEvent): Promise<void> {
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

      if (backupFileName.length !== 0) {
        this.logger.debug('Publishing EMAIL_BACKUP_ATTACHMENT_CREATED event')

        await this.domainEventPublisher.publish(
          this.domainEventFactory.createEmailBackupAttachmentCreatedEvent({
            backupFileName,
            backupFileIndex: bundleIndex++,
            backupFilesTotal: itemUuidBundles.length,
            email: authParams.identifier as string,
          }),
        )
      }
    }
  }
}

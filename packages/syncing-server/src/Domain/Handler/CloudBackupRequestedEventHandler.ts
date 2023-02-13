import { DomainEventHandlerInterface, CloudBackupRequestedEvent } from '@standardnotes/domain-events'

import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { ItemQuery } from '../Item/ItemQuery'
import { AuthHttpServiceInterface } from '../Auth/AuthHttpServiceInterface'
import { Item } from '../Item/Item'
import { ExtensionsHttpServiceInterface } from '../Extension/ExtensionsHttpServiceInterface'
import { ItemBackupServiceInterface } from '../Item/ItemBackupServiceInterface'
import { Logger } from 'winston'
import { KeyParamsData } from '@standardnotes/responses'

export class CloudBackupRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private itemRepository: ItemRepositoryInterface,
    private authHttpService: AuthHttpServiceInterface,
    private extensionsHttpService: ExtensionsHttpServiceInterface,
    private itemBackupService: ItemBackupServiceInterface,
    private extensionsServerUrl: string,
    private logger: Logger,
  ) {}

  async handle(event: CloudBackupRequestedEvent): Promise<void> {
    const items = await this.getItemsForPostingToExtension(event)

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

    const backupFilename = await this.itemBackupService.backup(items, authParams)

    this.logger.debug(`Sending ${items.length} items to extensions server for user ${event.payload.userUuid}`)

    await this.extensionsHttpService.triggerCloudBackupOnExtensionsServer({
      cloudProvider: event.payload.cloudProvider,
      authParams,
      backupFilename,
      forceMute: event.payload.userHasEmailsMuted,
      muteEmailsSettingUuid: event.payload.muteEmailsSettingUuid,
      extensionsServerUrl: this.getExtensionsServerUrl(event),
      userUuid: event.payload.userUuid,
    })
  }

  private getExtensionsServerUrl(event: CloudBackupRequestedEvent): string {
    switch (event.payload.cloudProvider) {
      case 'ONE_DRIVE':
        return `${this.extensionsServerUrl}/onedrive/sync?type=sf&key=${event.payload.cloudProviderToken}`
      case 'GOOGLE_DRIVE':
        return `${this.extensionsServerUrl}/gdrive/sync?key=${event.payload.cloudProviderToken}`
      case 'DROPBOX':
        return `${this.extensionsServerUrl}/dropbox/items/sync?type=sf&dbt=${event.payload.cloudProviderToken}`
      default:
        throw new Error(`Unsupported cloud provider ${event.payload.cloudProvider}`)
    }
  }

  private async getItemsForPostingToExtension(event: CloudBackupRequestedEvent): Promise<Item[]> {
    const itemQuery: ItemQuery = {
      userUuid: event.payload.userUuid,
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
      deleted: false,
    }

    return this.itemRepository.findAll(itemQuery)
  }
}

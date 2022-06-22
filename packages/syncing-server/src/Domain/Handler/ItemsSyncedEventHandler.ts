import { DomainEventHandlerInterface, ItemsSyncedEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { ItemQuery } from '../Item/ItemQuery'
import { AuthHttpServiceInterface } from '../Auth/AuthHttpServiceInterface'
import { Item } from '../Item/Item'
import { ExtensionsHttpServiceInterface } from '../Extension/ExtensionsHttpServiceInterface'
import { ItemBackupServiceInterface } from '../Item/ItemBackupServiceInterface'
import { Logger } from 'winston'
import { KeyParamsData } from '@standardnotes/responses'

@injectable()
export class ItemsSyncedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.ItemRepository) private itemRepository: ItemRepositoryInterface,
    @inject(TYPES.AuthHttpService) private authHttpService: AuthHttpServiceInterface,
    @inject(TYPES.ExtensionsHttpService) private extensionsHttpService: ExtensionsHttpServiceInterface,
    @inject(TYPES.ItemBackupService) private itemBackupService: ItemBackupServiceInterface,
    @inject(TYPES.INTERNAL_DNS_REROUTE_ENABLED) private internalDNSRerouteEnabled: boolean,
    @inject(TYPES.EXTENSIONS_SERVER_URL) private extensionsServerUrl: string,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async handle(event: ItemsSyncedEvent): Promise<void> {
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

    let backupFilename = ''
    if (!event.payload.skipFileBackup) {
      backupFilename = await this.itemBackupService.backup(items, authParams)
    }
    const backingUpViaProxyFile = backupFilename !== ''

    this.logger.debug(`Sending ${items.length} items to extensions server for user ${event.payload.userUuid}`)

    await this.extensionsHttpService.sendItemsToExtensionsServer({
      items: backingUpViaProxyFile ? undefined : items,
      authParams,
      backupFilename,
      forceMute: event.payload.forceMute,
      extensionsServerUrl: this.getExtensionsServerUrl(event),
      userUuid: event.payload.userUuid,
      extensionId: event.payload.extensionId,
    })
  }

  private getExtensionsServerUrl(event: ItemsSyncedEvent): string {
    if (this.internalDNSRerouteEnabled) {
      return event.payload.extensionUrl.replace('https://extensions.standardnotes.org', this.extensionsServerUrl)
    }

    return event.payload.extensionUrl
  }

  private async getItemsForPostingToExtension(event: ItemsSyncedEvent): Promise<Item[]> {
    const itemQuery: ItemQuery = {
      userUuid: event.payload.userUuid,
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
    }
    if (event.payload.itemUuids.length) {
      itemQuery.uuids = event.payload.itemUuids
    } else {
      itemQuery.deleted = false
    }

    return this.itemRepository.findAll(itemQuery)
  }
}

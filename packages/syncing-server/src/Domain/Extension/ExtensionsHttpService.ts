import { KeyParamsData } from '@standardnotes/responses'
import { DomainEventInterface, DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { EmailLevel } from '@standardnotes/domain-core'
import { AxiosInstance } from 'axios'
import { Logger } from 'winston'

import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { ContentDecoderInterface } from '../Item/ContentDecoderInterface'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { ExtensionName } from './ExtensionName'
import { ExtensionsHttpServiceInterface } from './ExtensionsHttpServiceInterface'
import { SendItemsToExtensionsServerDTO } from './SendItemsToExtensionsServerDTO'
import { getBody as googleDriveBody, getSubject as googleDriveSubject } from '../Email/GoogleDriveBackupFailed'
import { getBody as dropboxBody, getSubject as dropboxSubject } from '../Email/DropboxBackupFailed'
import { getBody as oneDriveBody, getSubject as oneDriveSubject } from '../Email/OneDriveBackupFailed'

export class ExtensionsHttpService implements ExtensionsHttpServiceInterface {
  constructor(
    private httpClient: AxiosInstance,
    private primaryItemRepository: ItemRepositoryInterface,
    private contentDecoder: ContentDecoderInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private logger: Logger,
  ) {}

  async triggerCloudBackupOnExtensionsServer(dto: {
    cloudProvider: 'DROPBOX' | 'GOOGLE_DRIVE' | 'ONE_DRIVE'
    extensionsServerUrl: string
    backupFilename: string
    authParams: KeyParamsData
    forceMute: boolean
    userUuid: string
  }): Promise<void> {
    let sent = false
    try {
      const payload: Record<string, unknown> = {
        backup_filename: dto.backupFilename,
        auth_params: dto.authParams,
        silent: dto.forceMute,
        user_uuid: dto.userUuid,
      }

      const response = await this.httpClient.request({
        method: 'POST',
        url: dto.extensionsServerUrl,
        headers: {
          'Content-Type': 'application/json',
        },
        data: payload,
        validateStatus:
          /* istanbul ignore next */
          (status: number) => status >= 200 && status < 500,
      })

      sent = response.status >= 200 && response.status < 300
    } catch (error) {
      this.logger.error(`[${dto.userUuid}] Failed to send a request to extensions server: ${(error as Error).message}`)
    }

    if (!sent && !dto.forceMute) {
      await this.domainEventPublisher.publish(
        this.createCloudBackupFailedEventBasedOnProvider(dto.cloudProvider, dto.authParams.identifier as string),
      )
    }
  }

  async sendItemsToExtensionsServer(dto: SendItemsToExtensionsServerDTO): Promise<void> {
    let sent = false
    try {
      const payload: Record<string, unknown> = {
        backup_filename: dto.backupFilename,
        auth_params: dto.authParams,
        silent: dto.forceMute,
        user_uuid: dto.userUuid,
      }
      if (dto.items !== undefined) {
        payload.items = dto.items
      }

      const response = await this.httpClient.request({
        method: 'POST',
        url: dto.extensionsServerUrl,
        headers: {
          'Content-Type': 'application/json',
        },
        data: payload,
        validateStatus:
          /* istanbul ignore next */
          (status: number) => status >= 200 && status < 500,
      })

      sent = response.status >= 200 && response.status < 300
    } catch (error) {
      this.logger.error(`[${dto.userUuid}] Failed to send a request to extensions server: ${(error as Error).message}`)
    }

    if (!sent && !dto.forceMute) {
      await this.domainEventPublisher.publish(
        await this.getBackupFailedEvent(dto.extensionId, dto.userUuid, dto.authParams.identifier as string),
      )
    }
  }

  private createCloudBackupFailedEventBasedOnProvider(
    cloudProvider: 'DROPBOX' | 'GOOGLE_DRIVE' | 'ONE_DRIVE',
    email: string,
  ): DomainEventInterface {
    switch (cloudProvider) {
      case 'DROPBOX':
        return this.domainEventFactory.createEmailRequestedEvent({
          userEmail: email,
          level: EmailLevel.LEVELS.FailedCloudBackup,
          body: dropboxBody(),
          messageIdentifier: 'FAILED_DROPBOX_BACKUP',
          subject: dropboxSubject(),
        })
      case 'GOOGLE_DRIVE':
        return this.domainEventFactory.createEmailRequestedEvent({
          userEmail: email,
          level: EmailLevel.LEVELS.FailedCloudBackup,
          body: googleDriveBody(),
          messageIdentifier: 'FAILED_GOOGLE_DRIVE_BACKUP',
          subject: googleDriveSubject(),
        })
      case 'ONE_DRIVE':
        return this.domainEventFactory.createEmailRequestedEvent({
          userEmail: email,
          level: EmailLevel.LEVELS.FailedCloudBackup,
          body: oneDriveBody(),
          messageIdentifier: 'FAILED_ONE_DRIVE_BACKUP',
          subject: oneDriveSubject(),
        })
    }
  }

  private async getBackupFailedEvent(
    extensionId: string,
    userUuid: string,
    email: string,
  ): Promise<DomainEventInterface> {
    const extension = await this.primaryItemRepository.findByUuidAndUserUuid(extensionId, userUuid)
    if (extension === null || !extension.props.content) {
      throw Error(`Could not find extensions with id ${extensionId}`)
    }

    const content = this.contentDecoder.decode(extension.props.content)
    switch (this.getExtensionName(content)) {
      case ExtensionName.Dropbox:
        return this.createCloudBackupFailedEventBasedOnProvider('DROPBOX', email)
      case ExtensionName.GoogleDrive:
        return this.createCloudBackupFailedEventBasedOnProvider('GOOGLE_DRIVE', email)
      case ExtensionName.OneDrive:
        return this.createCloudBackupFailedEventBasedOnProvider('ONE_DRIVE', email)
    }
  }

  private getExtensionName(content: Record<string, unknown>): ExtensionName {
    if ('name' in content) {
      return <ExtensionName>content.name
    }

    const url = 'url' in content ? <string>content.url : undefined

    if (url) {
      if (url.indexOf('dbt') !== -1) {
        return ExtensionName.Dropbox
      } else if (url.indexOf('gdrive') !== -1) {
        return ExtensionName.GoogleDrive
      } else if (url.indexOf('onedrive') !== -1) {
        return ExtensionName.OneDrive
      }
    }

    throw Error('Could not deduce extension name from extension content')
  }
}

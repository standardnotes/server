import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import {
  DropboxBackupFrequency,
  EmailBackupFrequency,
  GoogleDriveBackupFrequency,
  LogSessionUserAgentOption,
  MuteFailedBackupsEmailsOption,
  MuteFailedCloudBackupsEmailsOption,
  OneDriveBackupFrequency,
  SettingName,
} from '@standardnotes/settings'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { User } from '../User/User'
import { Setting } from './Setting'
import { SettingDecrypterInterface } from './SettingDecrypterInterface'
import { SettingInterpreterInterface } from './SettingInterpreterInterface'
import { SettingRepositoryInterface } from './SettingRepositoryInterface'

@injectable()
export class SettingInterpreter implements SettingInterpreterInterface {
  private readonly cloudBackupTokenSettings = [
    SettingName.DropboxBackupToken,
    SettingName.GoogleDriveBackupToken,
    SettingName.OneDriveBackupToken,
  ]

  private readonly cloudBackupFrequencySettings = [
    SettingName.DropboxBackupFrequency,
    SettingName.GoogleDriveBackupFrequency,
    SettingName.OneDriveBackupFrequency,
  ]

  private readonly cloudBackupFrequencyDisabledValues = [
    DropboxBackupFrequency.Disabled,
    GoogleDriveBackupFrequency.Disabled,
    OneDriveBackupFrequency.Disabled,
  ]

  constructor(
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.SettingRepository) private settingRepository: SettingRepositoryInterface,
    @inject(TYPES.SettingDecrypter) private settingDecrypter: SettingDecrypterInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async interpretSettingUpdated(updatedSetting: Setting, user: User, unencryptedValue: string | null): Promise<void> {
    if (this.isEnablingEmailBackupSetting(updatedSetting)) {
      await this.triggerEmailBackup(user.uuid)
    }

    if (this.isEnablingCloudBackupSetting(updatedSetting)) {
      await this.triggerCloudBackup(updatedSetting, user.uuid, unencryptedValue)
    }

    if (this.isDisablingSessionUserAgentLogging(updatedSetting)) {
      await this.triggerSessionUserAgentCleanup(user)
    }
  }

  private async triggerEmailBackup(userUuid: string): Promise<void> {
    let userHasEmailsMuted = false
    let muteEmailsSettingUuid = ''
    const muteFailedEmailsBackupSetting = await this.settingRepository.findOneByNameAndUserUuid(
      SettingName.MuteFailedBackupsEmails,
      userUuid,
    )
    if (muteFailedEmailsBackupSetting !== null) {
      userHasEmailsMuted = muteFailedEmailsBackupSetting.value === MuteFailedBackupsEmailsOption.Muted
      muteEmailsSettingUuid = muteFailedEmailsBackupSetting.uuid
    }

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createEmailBackupRequestedEvent(userUuid, muteEmailsSettingUuid, userHasEmailsMuted),
    )
  }

  private isEnablingEmailBackupSetting(setting: Setting): boolean {
    return setting.name === SettingName.EmailBackupFrequency && setting.value !== EmailBackupFrequency.Disabled
  }

  private isEnablingCloudBackupSetting(setting: Setting): boolean {
    return (
      (this.cloudBackupFrequencySettings.includes(setting.name as SettingName) ||
        this.cloudBackupTokenSettings.includes(setting.name as SettingName)) &&
      !this.cloudBackupFrequencyDisabledValues.includes(
        setting.value as DropboxBackupFrequency | OneDriveBackupFrequency | GoogleDriveBackupFrequency,
      )
    )
  }

  private isDisablingSessionUserAgentLogging(setting: Setting): boolean {
    return SettingName.LogSessionUserAgent === setting.name && LogSessionUserAgentOption.Disabled === setting.value
  }

  private async triggerSessionUserAgentCleanup(user: User) {
    await this.domainEventPublisher.publish(
      this.domainEventFactory.createUserDisabledSessionUserAgentLoggingEvent({
        userUuid: user.uuid,
        email: user.email,
      }),
    )
  }

  private async triggerCloudBackup(setting: Setting, userUuid: string, unencryptedValue: string | null): Promise<void> {
    let cloudProvider
    let tokenSettingName
    switch (setting.name) {
      case SettingName.DropboxBackupToken:
      case SettingName.DropboxBackupFrequency:
        cloudProvider = 'DROPBOX'
        tokenSettingName = SettingName.DropboxBackupToken
        break
      case SettingName.GoogleDriveBackupToken:
      case SettingName.GoogleDriveBackupFrequency:
        cloudProvider = 'GOOGLE_DRIVE'
        tokenSettingName = SettingName.GoogleDriveBackupToken
        break
      case SettingName.OneDriveBackupToken:
      case SettingName.OneDriveBackupFrequency:
        cloudProvider = 'ONE_DRIVE'
        tokenSettingName = SettingName.OneDriveBackupToken
        break
    }

    let backupToken = null
    if (this.cloudBackupFrequencySettings.includes(setting.name as SettingName)) {
      const tokenSetting = await this.settingRepository.findLastByNameAndUserUuid(
        tokenSettingName as SettingName,
        userUuid,
      )
      if (tokenSetting !== null) {
        backupToken = await this.settingDecrypter.decryptSettingValue(tokenSetting, userUuid)
      }
    } else {
      backupToken = unencryptedValue
    }

    if (!backupToken) {
      this.logger.error(`Could not trigger backup. Missing backup token for user ${userUuid}`)

      return
    }

    let userHasEmailsMuted = false
    let muteEmailsSettingUuid = ''
    const muteFailedCloudBackupSetting = await this.settingRepository.findOneByNameAndUserUuid(
      SettingName.MuteFailedCloudBackupsEmails,
      userUuid,
    )
    if (muteFailedCloudBackupSetting !== null) {
      userHasEmailsMuted = muteFailedCloudBackupSetting.value === MuteFailedCloudBackupsEmailsOption.Muted
      muteEmailsSettingUuid = muteFailedCloudBackupSetting.uuid
    }

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createCloudBackupRequestedEvent(
        cloudProvider as 'DROPBOX' | 'GOOGLE_DRIVE' | 'ONE_DRIVE',
        backupToken,
        userUuid,
        muteEmailsSettingUuid,
        userHasEmailsMuted,
      ),
    )
  }
}

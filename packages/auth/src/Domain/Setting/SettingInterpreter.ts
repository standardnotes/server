import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { EmailLevel } from '@standardnotes/domain-core'
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
import { SettingDecrypterInterface } from './SettingDecrypterInterface'
import { SettingInterpreterInterface } from './SettingInterpreterInterface'
import { SettingRepositoryInterface } from './SettingRepositoryInterface'

@injectable()
export class SettingInterpreter implements SettingInterpreterInterface {
  private readonly cloudBackupTokenSettings = [
    SettingName.NAMES.DropboxBackupToken,
    SettingName.NAMES.GoogleDriveBackupToken,
    SettingName.NAMES.OneDriveBackupToken,
  ]

  private readonly cloudBackupFrequencySettings = [
    SettingName.NAMES.DropboxBackupFrequency,
    SettingName.NAMES.GoogleDriveBackupFrequency,
    SettingName.NAMES.OneDriveBackupFrequency,
  ]

  private readonly cloudBackupFrequencyDisabledValues = [
    DropboxBackupFrequency.Disabled,
    GoogleDriveBackupFrequency.Disabled,
    OneDriveBackupFrequency.Disabled,
  ]

  private readonly emailSettingToSubscriptionRejectionLevelMap: Map<string, string> = new Map([
    [SettingName.NAMES.MuteFailedBackupsEmails, EmailLevel.LEVELS.FailedEmailBackup],
    [SettingName.NAMES.MuteFailedCloudBackupsEmails, EmailLevel.LEVELS.FailedCloudBackup],
    [SettingName.NAMES.MuteMarketingEmails, EmailLevel.LEVELS.Marketing],
    [SettingName.NAMES.MuteSignInEmails, EmailLevel.LEVELS.SignIn],
  ])

  constructor(
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.SettingRepository) private settingRepository: SettingRepositoryInterface,
    @inject(TYPES.SettingDecrypter) private settingDecrypter: SettingDecrypterInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async interpretSettingUpdated(
    updatedSettingName: string,
    user: User,
    unencryptedValue: string | null,
  ): Promise<void> {
    if (this.isChangingMuteEmailsSetting(updatedSettingName)) {
      await this.triggerEmailSubscriptionChange(user, updatedSettingName, unencryptedValue)
    }

    if (this.isEnablingEmailBackupSetting(updatedSettingName, unencryptedValue)) {
      await this.triggerEmailBackup(user.uuid)
    }

    if (this.isEnablingCloudBackupSetting(updatedSettingName, unencryptedValue)) {
      await this.triggerCloudBackup(updatedSettingName, user.uuid, unencryptedValue)
    }

    if (this.isDisablingSessionUserAgentLogging(updatedSettingName, unencryptedValue)) {
      await this.triggerSessionUserAgentCleanup(user)
    }
  }

  private async triggerEmailBackup(userUuid: string): Promise<void> {
    let userHasEmailsMuted = false
    let muteEmailsSettingUuid = ''
    const muteFailedEmailsBackupSetting = await this.settingRepository.findOneByNameAndUserUuid(
      SettingName.NAMES.MuteFailedBackupsEmails,
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

  private isChangingMuteEmailsSetting(settingName: string): boolean {
    return [
      SettingName.NAMES.MuteFailedBackupsEmails,
      SettingName.NAMES.MuteFailedCloudBackupsEmails,
      SettingName.NAMES.MuteMarketingEmails,
      SettingName.NAMES.MuteSignInEmails,
    ].includes(settingName)
  }

  private isEnablingEmailBackupSetting(settingName: string, newValue: string | null): boolean {
    return (
      settingName === SettingName.NAMES.EmailBackupFrequency &&
      [EmailBackupFrequency.Daily, EmailBackupFrequency.Weekly].includes(newValue as EmailBackupFrequency)
    )
  }

  private isEnablingCloudBackupSetting(settingName: string, newValue: string | null): boolean {
    return (
      (this.cloudBackupFrequencySettings.includes(settingName) ||
        this.cloudBackupTokenSettings.includes(settingName)) &&
      !this.cloudBackupFrequencyDisabledValues.includes(
        newValue as DropboxBackupFrequency | OneDriveBackupFrequency | GoogleDriveBackupFrequency,
      )
    )
  }

  private isDisablingSessionUserAgentLogging(settingName: string, newValue: string | null): boolean {
    return SettingName.NAMES.LogSessionUserAgent === settingName && LogSessionUserAgentOption.Disabled === newValue
  }

  private async triggerEmailSubscriptionChange(
    user: User,
    settingName: string,
    unencryptedValue: string | null,
  ): Promise<void> {
    await this.domainEventPublisher.publish(
      this.domainEventFactory.createMuteEmailsSettingChangedEvent({
        username: user.email,
        mute: unencryptedValue === 'muted',
        emailSubscriptionRejectionLevel: this.emailSettingToSubscriptionRejectionLevelMap.get(settingName) as string,
      }),
    )
  }

  private async triggerSessionUserAgentCleanup(user: User) {
    await this.domainEventPublisher.publish(
      this.domainEventFactory.createUserDisabledSessionUserAgentLoggingEvent({
        userUuid: user.uuid,
        email: user.email,
      }),
    )
  }

  private async triggerCloudBackup(
    settingName: string,
    userUuid: string,
    unencryptedValue: string | null,
  ): Promise<void> {
    let cloudProvider
    let tokenSettingName
    switch (settingName) {
      case SettingName.NAMES.DropboxBackupToken:
      case SettingName.NAMES.DropboxBackupFrequency:
        cloudProvider = 'DROPBOX'
        tokenSettingName = SettingName.NAMES.DropboxBackupToken
        break
      case SettingName.NAMES.GoogleDriveBackupToken:
      case SettingName.NAMES.GoogleDriveBackupFrequency:
        cloudProvider = 'GOOGLE_DRIVE'
        tokenSettingName = SettingName.NAMES.GoogleDriveBackupToken
        break
      case SettingName.NAMES.OneDriveBackupToken:
      case SettingName.NAMES.OneDriveBackupFrequency:
        cloudProvider = 'ONE_DRIVE'
        tokenSettingName = SettingName.NAMES.OneDriveBackupToken
        break
    }

    let backupToken = null
    if (this.cloudBackupFrequencySettings.includes(settingName)) {
      const tokenSetting = await this.settingRepository.findLastByNameAndUserUuid(tokenSettingName as string, userUuid)
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
      SettingName.NAMES.MuteFailedCloudBackupsEmails,
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

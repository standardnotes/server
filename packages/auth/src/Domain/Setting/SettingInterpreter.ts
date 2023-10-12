import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { EmailLevel } from '@standardnotes/domain-core'
import {
  EmailBackupFrequency,
  LogSessionUserAgentOption,
  MuteFailedBackupsEmailsOption,
  SettingName,
} from '@standardnotes/settings'

import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { User } from '../User/User'
import { SettingInterpreterInterface } from './SettingInterpreterInterface'
import { SettingRepositoryInterface } from './SettingRepositoryInterface'
import { GetUserKeyParams } from '../UseCase/GetUserKeyParams/GetUserKeyParams'

export class SettingInterpreter implements SettingInterpreterInterface {
  private readonly emailSettingToSubscriptionRejectionLevelMap: Map<string, string> = new Map([
    [SettingName.NAMES.MuteFailedBackupsEmails, EmailLevel.LEVELS.FailedEmailBackup],
    [SettingName.NAMES.MuteFailedCloudBackupsEmails, EmailLevel.LEVELS.FailedCloudBackup],
    [SettingName.NAMES.MuteMarketingEmails, EmailLevel.LEVELS.Marketing],
    [SettingName.NAMES.MuteSignInEmails, EmailLevel.LEVELS.SignIn],
  ])

  constructor(
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private settingRepository: SettingRepositoryInterface,
    private getUserKeyParams: GetUserKeyParams,
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

    const keyParamsResponse = await this.getUserKeyParams.execute({
      authenticated: false,
      userUuid,
    })

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createEmailBackupRequestedEvent(
        userUuid,
        muteEmailsSettingUuid,
        userHasEmailsMuted,
        keyParamsResponse.keyParams,
      ),
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
}

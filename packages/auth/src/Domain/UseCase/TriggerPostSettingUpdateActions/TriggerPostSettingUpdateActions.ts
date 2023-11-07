import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { EmailLevel, Result, SettingName, UseCaseInterface } from '@standardnotes/domain-core'
import { EmailBackupFrequency, LogSessionUserAgentOption } from '@standardnotes/settings'

import { TriggerPostSettingUpdateActionsDTO } from './TriggerPostSettingUpdateActionsDTO'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { TriggerEmailBackupForUser } from '../TriggerEmailBackupForUser/TriggerEmailBackupForUser'

export class TriggerPostSettingUpdateActions implements UseCaseInterface<void> {
  private readonly emailSettingToSubscriptionRejectionLevelMap: Map<string, string> = new Map([
    [SettingName.NAMES.MuteFailedBackupsEmails, EmailLevel.LEVELS.FailedEmailBackup],
    [SettingName.NAMES.MuteFailedCloudBackupsEmails, EmailLevel.LEVELS.FailedCloudBackup],
    [SettingName.NAMES.MuteMarketingEmails, EmailLevel.LEVELS.Marketing],
    [SettingName.NAMES.MuteSignInEmails, EmailLevel.LEVELS.SignIn],
  ])

  constructor(
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private triggerEmailBackupForUser: TriggerEmailBackupForUser,
  ) {}

  async execute(dto: TriggerPostSettingUpdateActionsDTO): Promise<Result<void>> {
    if (this.isChangingMuteEmailsSetting(dto.updatedSettingName)) {
      await this.triggerEmailSubscriptionChange(dto.userEmail, dto.updatedSettingName, dto.unencryptedValue)
    }

    if (this.isEnablingEmailBackupSetting(dto.updatedSettingName, dto.unencryptedValue)) {
      await this.triggerEmailBackupForUser.execute({
        userUuid: dto.userUuid,
      })
    }

    if (this.isDisablingSessionUserAgentLogging(dto.updatedSettingName, dto.unencryptedValue)) {
      await this.triggerSessionUserAgentCleanup(dto.userEmail, dto.userUuid)
    }

    return Result.ok()
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
    userEmail: string,
    settingName: string,
    unencryptedValue: string | null,
  ): Promise<void> {
    await this.domainEventPublisher.publish(
      this.domainEventFactory.createMuteEmailsSettingChangedEvent({
        username: userEmail,
        mute: unencryptedValue === 'muted',
        emailSubscriptionRejectionLevel: this.emailSettingToSubscriptionRejectionLevelMap.get(settingName) as string,
      }),
    )
  }

  private async triggerSessionUserAgentCleanup(userEmail: string, userUuid: string) {
    await this.domainEventPublisher.publish(
      this.domainEventFactory.createUserDisabledSessionUserAgentLoggingEvent({
        userUuid,
        email: userEmail,
      }),
    )
  }
}

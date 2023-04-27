import { EmailLevel, Username } from '@standardnotes/domain-core'
import { DomainEventHandlerInterface, EmailSubscriptionUnsubscribedEvent } from '@standardnotes/domain-events'
import { SettingName } from '@standardnotes/settings'

import { SettingServiceInterface } from '../Setting/SettingServiceInterface'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'

export class EmailSubscriptionUnsubscribedEventHandler implements DomainEventHandlerInterface {
  constructor(private userRepository: UserRepositoryInterface, private settingsService: SettingServiceInterface) {}

  async handle(event: EmailSubscriptionUnsubscribedEvent): Promise<void> {
    const usernameOrError = Username.create(event.payload.userEmail)
    if (usernameOrError.isFailed()) {
      return
    }
    const username = usernameOrError.getValue()

    const user = await this.userRepository.findOneByUsernameOrEmail(username)
    if (user === null) {
      return
    }

    await this.settingsService.createOrReplace({
      user,
      props: {
        name: this.getSettingNameFromLevel(event.payload.level),
        unencryptedValue: 'muted',
        sensitive: false,
      },
    })
  }

  private getSettingNameFromLevel(level: string): string {
    switch (level) {
      case EmailLevel.LEVELS.FailedCloudBackup:
        return SettingName.NAMES.MuteFailedCloudBackupsEmails
      case EmailLevel.LEVELS.FailedEmailBackup:
        return SettingName.NAMES.MuteFailedBackupsEmails
      case EmailLevel.LEVELS.Marketing:
        return SettingName.NAMES.MuteMarketingEmails
      case EmailLevel.LEVELS.SignIn:
        return SettingName.NAMES.MuteSignInEmails
      default:
        throw new Error(`Unknown level: ${level}`)
    }
  }
}

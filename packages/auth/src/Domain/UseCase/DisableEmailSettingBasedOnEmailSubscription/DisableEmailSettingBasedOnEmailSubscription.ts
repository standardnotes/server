import { EmailLevel, Result, UseCaseInterface, Username } from '@standardnotes/domain-core'
import { SettingName } from '@standardnotes/settings'

import { DisableEmailSettingBasedOnEmailSubscriptionDTO } from './DisableEmailSettingBasedOnEmailSubscriptionDTO'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { SettingFactoryInterface } from '../../Setting/SettingFactoryInterface'

export class DisableEmailSettingBasedOnEmailSubscription implements UseCaseInterface<void> {
  constructor(
    private userRepository: UserRepositoryInterface,
    private settingRepository: SettingRepositoryInterface,
    private factory: SettingFactoryInterface,
  ) {}

  async execute(dto: DisableEmailSettingBasedOnEmailSubscriptionDTO): Promise<Result<void>> {
    const usernameOrError = Username.create(dto.userEmail)
    if (usernameOrError.isFailed()) {
      return Result.fail(usernameOrError.getError())
    }
    const username = usernameOrError.getValue()

    const user = await this.userRepository.findOneByUsernameOrEmail(username)
    if (user === null) {
      return Result.fail(`User not found for email ${dto.userEmail}`)
    }

    const settingNameOrError = this.getSettingNameFromLevel(dto.level)
    if (settingNameOrError.isFailed()) {
      return Result.fail(settingNameOrError.getError())
    }
    const settingName = settingNameOrError.getValue()

    let setting = await this.settingRepository.findLastByNameAndUserUuid(settingName, user.uuid)
    if (!setting) {
      setting = await this.factory.create(
        {
          name: settingName,
          unencryptedValue: 'muted',
          sensitive: false,
        },
        user,
      )
    } else {
      setting = await this.factory.createReplacement(setting, {
        name: settingName,
        unencryptedValue: 'muted',
        sensitive: false,
      })
    }

    await this.settingRepository.save(setting)

    return Result.ok()
  }

  private getSettingNameFromLevel(level: string): Result<string> {
    /* istanbul ignore next */
    switch (level) {
      case EmailLevel.LEVELS.FailedCloudBackup:
        return Result.ok(SettingName.NAMES.MuteFailedCloudBackupsEmails)
      case EmailLevel.LEVELS.FailedEmailBackup:
        return Result.ok(SettingName.NAMES.MuteFailedBackupsEmails)
      case EmailLevel.LEVELS.Marketing:
        return Result.ok(SettingName.NAMES.MuteMarketingEmails)
      case EmailLevel.LEVELS.SignIn:
        return Result.ok(SettingName.NAMES.MuteSignInEmails)
      default:
        return Result.fail(`Unknown level: ${level}`)
    }
  }
}

import { EmailLevel, Result, SettingName, UseCaseInterface, Username } from '@standardnotes/domain-core'

import { DisableEmailSettingBasedOnEmailSubscriptionDTO } from './DisableEmailSettingBasedOnEmailSubscriptionDTO'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { SetSettingValue } from '../SetSettingValue/SetSettingValue'
import { SetSubscriptionSettingValue } from '../SetSubscriptionSettingValue/SetSubscriptionSettingValue'
import { GetSharedOrRegularSubscriptionForUser } from '../GetSharedOrRegularSubscriptionForUser/GetSharedOrRegularSubscriptionForUser'

export class DisableEmailSettingBasedOnEmailSubscription implements UseCaseInterface<void> {
  constructor(
    private userRepository: UserRepositoryInterface,
    private setSettingValue: SetSettingValue,
    private setSubscriptionSetting: SetSubscriptionSettingValue,
    private getSharedOrRegularSubscriptionForUser: GetSharedOrRegularSubscriptionForUser,
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

    if (settingName.isASubscriptionSetting()) {
      const subscriptionOrError = await this.getSharedOrRegularSubscriptionForUser.execute({
        userUuid: user.uuid,
      })
      if (subscriptionOrError.isFailed()) {
        return Result.fail(subscriptionOrError.getError())
      }
      const subscription = subscriptionOrError.getValue()

      return this.setSubscriptionSetting.execute({
        settingName: settingName.value,
        userSubscriptionUuid: subscription.uuid,
        value: 'muted',
      })
    } else {
      return this.setSettingValue.execute({
        settingName: settingName.value,
        userUuid: user.uuid,
        value: 'muted',
      })
    }
  }

  private getSettingNameFromLevel(level: string): Result<SettingName> {
    /* istanbul ignore next */
    switch (level) {
      case EmailLevel.LEVELS.Marketing:
        return Result.ok(SettingName.create(SettingName.NAMES.MuteMarketingEmails).getValue())
      case EmailLevel.LEVELS.SignIn:
        return Result.ok(SettingName.create(SettingName.NAMES.MuteSignInEmails).getValue())
      default:
        return Result.fail(`Unknown level: ${level}`)
    }
  }
}

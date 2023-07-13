import { Result, SubscriptionPlanName, UseCaseInterface, Username } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

import { RoleServiceInterface } from '../../Role/RoleServiceInterface'
import { UserSubscriptionRepositoryInterface } from '../../Subscription/UserSubscriptionRepositoryInterface'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { UserSubscription } from '../../Subscription/UserSubscription'
import { UserSubscriptionType } from '../../Subscription/UserSubscriptionType'
import { ActivatePremiumFeaturesDTO } from './ActivatePremiumFeaturesDTO'
import { SubscriptionSettingServiceInterface } from '../../Setting/SubscriptionSettingServiceInterface'
import { SettingName } from '@standardnotes/settings'

export class ActivatePremiumFeatures implements UseCaseInterface<string> {
  constructor(
    private userRepository: UserRepositoryInterface,
    private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    private subscriptionSettingService: SubscriptionSettingServiceInterface,
    private roleService: RoleServiceInterface,
    private timer: TimerInterface,
  ) {}

  async execute(dto: ActivatePremiumFeaturesDTO): Promise<Result<string>> {
    const usernameOrError = Username.create(dto.username)
    if (usernameOrError.isFailed()) {
      return Result.fail(usernameOrError.getError())
    }
    const username = usernameOrError.getValue()

    const user = await this.userRepository.findOneByUsernameOrEmail(username)
    if (user === null) {
      return Result.fail(`User not found with username: ${username.value}`)
    }

    const timestamp = this.timer.getTimestampInMicroseconds()

    const subscription = new UserSubscription()
    subscription.planName = SubscriptionPlanName.NAMES.ProPlan
    subscription.user = Promise.resolve(user)
    subscription.createdAt = timestamp
    subscription.updatedAt = timestamp
    subscription.endsAt = this.timer.convertDateToMicroseconds(this.timer.getUTCDateNDaysAhead(365))
    subscription.cancelled = false
    subscription.subscriptionId = 1
    subscription.subscriptionType = UserSubscriptionType.Regular

    await this.userSubscriptionRepository.save(subscription)

    await this.roleService.addUserRole(user, SubscriptionPlanName.NAMES.ProPlan)

    await this.subscriptionSettingService.applyDefaultSubscriptionSettingsForSubscription(
      subscription,
      new Map([[SettingName.NAMES.FileUploadBytesLimit, '0']]),
    )

    return Result.ok('Premium features activated.')
  }
}

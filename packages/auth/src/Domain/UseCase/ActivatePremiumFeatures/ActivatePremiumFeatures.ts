import { Result, SettingName, SubscriptionPlanName, UseCaseInterface, Username } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

import { RoleServiceInterface } from '../../Role/RoleServiceInterface'
import { UserSubscriptionRepositoryInterface } from '../../Subscription/UserSubscriptionRepositoryInterface'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { UserSubscription } from '../../Subscription/UserSubscription'
import { UserSubscriptionType } from '../../Subscription/UserSubscriptionType'
import { ActivatePremiumFeaturesDTO } from './ActivatePremiumFeaturesDTO'
import { ApplyDefaultSubscriptionSettings } from '../ApplyDefaultSubscriptionSettings/ApplyDefaultSubscriptionSettings'

export class ActivatePremiumFeatures implements UseCaseInterface<string> {
  constructor(
    private userRepository: UserRepositoryInterface,
    private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    private applyDefaultSubscriptionSettings: ApplyDefaultSubscriptionSettings,
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

    if (dto.cancelPreviousSubscription) {
      const previousSubscription = await this.userSubscriptionRepository.findOneByUserUuid(user.uuid)
      if (previousSubscription) {
        previousSubscription.cancelled = true
        previousSubscription.updatedAt = this.timer.getTimestampInMicroseconds()

        await this.userSubscriptionRepository.save(previousSubscription)
      }
    }

    const subscriptionPlanNameString = dto.subscriptionPlanName ?? SubscriptionPlanName.NAMES.ProPlan
    const subscriptionPlanNameOrError = SubscriptionPlanName.create(subscriptionPlanNameString)
    if (subscriptionPlanNameOrError.isFailed()) {
      return Result.fail(subscriptionPlanNameOrError.getError())
    }
    const subscriptionPlanName = subscriptionPlanNameOrError.getValue()

    const timestamp = this.timer.getTimestampInMicroseconds()

    const endsAt = dto.endsAt ?? this.timer.getUTCDateNDaysAhead(365)

    const subscription = new UserSubscription()
    subscription.planName = subscriptionPlanName.value
    subscription.userUuid = user.uuid
    subscription.createdAt = timestamp
    subscription.updatedAt = timestamp
    subscription.endsAt = this.timer.convertDateToMicroseconds(endsAt)
    subscription.cancelled = false
    subscription.subscriptionId = dto.subscriptionId
    subscription.subscriptionType = UserSubscriptionType.Regular

    await this.userSubscriptionRepository.save(subscription)

    await this.roleService.addUserRoleBasedOnSubscription(user, subscriptionPlanName.value)

    await this.applyDefaultSubscriptionSettings.execute({
      userSubscriptionUuid: subscription.uuid,
      userUuid: user.uuid,
      subscriptionPlanName: subscriptionPlanName.value,
      overrides: new Map([[SettingName.NAMES.FileUploadBytesLimit, `${dto.uploadBytesLimit ?? -1}`]]),
    })

    return Result.ok('Premium features activated.')
  }
}

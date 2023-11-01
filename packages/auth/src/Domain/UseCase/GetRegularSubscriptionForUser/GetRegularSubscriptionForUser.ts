import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { UserSubscription } from '../../Subscription/UserSubscription'
import { GetRegularSubscriptionForUserDTO } from './GetRegularSubscriptionForUserDTO'
import { UserSubscriptionRepositoryInterface } from '../../Subscription/UserSubscriptionRepositoryInterface'
import { UserSubscriptionType } from '../../Subscription/UserSubscriptionType'

export class GetRegularSubscriptionForUser implements UseCaseInterface<UserSubscription> {
  constructor(private userSubscriptionRepository: UserSubscriptionRepositoryInterface) {}

  async execute(dto: GetRegularSubscriptionForUserDTO): Promise<Result<UserSubscription>> {
    if (dto.userUuid !== undefined) {
      return this.getRegularSubscriptionForUser(dto.userUuid)
    }
    if (dto.subscriptionId !== undefined) {
      return this.getRegularSubscriptionForSharedSubscription(dto.subscriptionId)
    }

    return Result.fail('Invalid parameters.')
  }

  private async getRegularSubscriptionForUser(userUuidString: string): Promise<Result<UserSubscription>> {
    const userUuidOrError = Uuid.create(userUuidString)
    if (userUuidOrError.isFailed()) {
      return Result.fail(`Could not get regular subscription for user: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const userSubscription = await this.userSubscriptionRepository.findOneByUserUuidAndType(
      userUuid.value,
      UserSubscriptionType.Regular,
    )
    if (userSubscription === null) {
      return Result.fail(`User subscription for user ${userUuid.value} not found.`)
    }

    return Result.ok(userSubscription)
  }

  private async getRegularSubscriptionForSharedSubscription(subscriptionId: number): Promise<Result<UserSubscription>> {
    const userSubscription = await this.userSubscriptionRepository.findBySubscriptionIdAndType(
      subscriptionId,
      UserSubscriptionType.Regular,
    )
    if (userSubscription.length === 0) {
      return Result.fail(`User subscription for shared subscription ${subscriptionId} not found.`)
    }

    return Result.ok(userSubscription[0])
  }
}

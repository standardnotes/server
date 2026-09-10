import { TimerInterface } from '@standardnotes/time'

import { UserSubscription } from '../../Subscription/UserSubscription'
import { UserSubscriptionRepositoryInterface } from '../../Subscription/UserSubscriptionRepositoryInterface'
import { SelectValidUserSubscriptionDTO } from './SelectValidUserSubscriptionDTO'

export class SelectValidUserSubscription {
  constructor(
    private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    private timer: TimerInterface,
  ) {}

  async execute(dto: SelectValidUserSubscriptionDTO): Promise<UserSubscription | null> {
    const subscriptions =
      dto.subscriptionType === undefined
        ? await this.userSubscriptionRepository.findByUserUuid(dto.userUuid)
        : await this.userSubscriptionRepository.findByUserUuidAndType(dto.userUuid, dto.subscriptionType)

    return this.selectFromSubscriptions(subscriptions)
  }

  private selectFromSubscriptions(subscriptions: UserSubscription[]): UserSubscription | null {
    if (subscriptions.length === 0) {
      return null
    }

    const currentTimestampInMicroseconds = this.timer.getTimestampInMicroseconds()
    const sortedSubscriptions = [...subscriptions].sort(
      (a, b) => Number(b.endsAt) - Number(a.endsAt),
    )

    const unexpiredSubscriptions = sortedSubscriptions.filter(
      (subscription) => Number(subscription.endsAt) > currentTimestampInMicroseconds,
    )

    if (unexpiredSubscriptions.length > 0) {
      const unexpiredUncancelled = unexpiredSubscriptions.find((subscription) => !subscription.cancelled)
      if (unexpiredUncancelled !== undefined) {
        return unexpiredUncancelled
      }

      return unexpiredSubscriptions[0]
    }

    const expiredUncancelled = sortedSubscriptions.find((subscription) => !subscription.cancelled)
    if (expiredUncancelled !== undefined) {
      return expiredUncancelled
    }

    return sortedSubscriptions[0]
  }
}

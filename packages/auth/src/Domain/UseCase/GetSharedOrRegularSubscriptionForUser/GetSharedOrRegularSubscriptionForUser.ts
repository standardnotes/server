import { Result, UseCaseInterface } from '@standardnotes/domain-core'

import { UserSubscription } from '../../Subscription/UserSubscription'
import { GetRegularSubscriptionForUser } from '../GetRegularSubscriptionForUser/GetRegularSubscriptionForUser'
import { GetSharedSubscriptionForUser } from '../GetSharedSubscriptionForUser/GetSharedSubscriptionForUser'
import { GetSharedOrRegularSubscriptionForUserDTO } from './GetSharedOrRegularSubscriptionForUserDTO'

export class GetSharedOrRegularSubscriptionForUser implements UseCaseInterface<UserSubscription> {
  constructor(
    private getRegularSubscriptionForUser: GetRegularSubscriptionForUser,
    private getSharedSubscriptionForUser: GetSharedSubscriptionForUser,
  ) {}

  async execute(dto: GetSharedOrRegularSubscriptionForUserDTO): Promise<Result<UserSubscription>> {
    const sharedSubscriptionOrError = await this.getSharedSubscriptionForUser.execute(dto)
    if (sharedSubscriptionOrError.isFailed()) {
      return this.getRegularSubscriptionForUser.execute(dto)
    }
    const sharedSubscription = sharedSubscriptionOrError.getValue()

    return Result.ok(sharedSubscription)
  }
}

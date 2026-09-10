import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { UserSubscription } from '../../Subscription/UserSubscription'
import { GetSharedSubscriptionForUserDTO } from './GetSharedSubscriptionForUserDTO'
import { UserSubscriptionType } from '../../Subscription/UserSubscriptionType'
import { SelectValidUserSubscription } from '../SelectValidUserSubscription/SelectValidUserSubscription'

export class GetSharedSubscriptionForUser implements UseCaseInterface<UserSubscription> {
  constructor(private selectValidUserSubscription: SelectValidUserSubscription) {}

  async execute(dto: GetSharedSubscriptionForUserDTO): Promise<Result<UserSubscription>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(`Could not get shared subscription for user: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const userSubscription = await this.selectValidUserSubscription.execute({
      userUuid: userUuid.value,
      subscriptionType: UserSubscriptionType.Shared,
    })
    if (userSubscription === null) {
      return Result.fail(`User subscription for user ${userUuid.value} not found.`)
    }

    return Result.ok(userSubscription)
  }
}

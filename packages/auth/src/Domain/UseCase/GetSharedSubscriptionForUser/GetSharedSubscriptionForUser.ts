import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { UserSubscription } from '../../Subscription/UserSubscription'
import { UserSubscriptionRepositoryInterface } from '../../Subscription/UserSubscriptionRepositoryInterface'
import { GetSharedSubscriptionForUserDTO } from './GetSharedSubscriptionForUserDTO'
import { UserSubscriptionType } from '../../Subscription/UserSubscriptionType'

export class GetSharedSubscriptionForUser implements UseCaseInterface<UserSubscription> {
  constructor(private userSubscriptionRepository: UserSubscriptionRepositoryInterface) {}

  async execute(dto: GetSharedSubscriptionForUserDTO): Promise<Result<UserSubscription>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const userSubscription = await this.userSubscriptionRepository.findOneByUserUuidAndType(
      userUuid.value,
      UserSubscriptionType.Shared,
    )
    if (userSubscription === null) {
      return Result.fail(`User subscription for user ${userUuid.value} not found.`)
    }

    return Result.ok(userSubscription)
  }
}

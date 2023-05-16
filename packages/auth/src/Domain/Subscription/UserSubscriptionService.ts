import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { FindRegularSubscriptionResponse } from './FindRegularSubscriptionResponse'

import { UserSubscription } from './UserSubscription'
import { UserSubscriptionRepositoryInterface } from './UserSubscriptionRepositoryInterface'
import { UserSubscriptionServiceInterface } from './UserSubscriptionServiceInterface'
import { UserSubscriptionType } from './UserSubscriptionType'

@injectable()
export class UserSubscriptionService implements UserSubscriptionServiceInterface {
  constructor(
    @inject(TYPES.Auth_UserSubscriptionRepository)
    private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
  ) {}

  async findRegularSubscriptionForUserUuid(userUuid: string): Promise<FindRegularSubscriptionResponse> {
    const userSubscription = await this.userSubscriptionRepository.findOneByUserUuid(userUuid)

    return this.findRegularSubscription(userSubscription)
  }

  async findRegularSubscriptionForUuid(uuid: string): Promise<FindRegularSubscriptionResponse> {
    const userSubscription = await this.userSubscriptionRepository.findOneByUuid(uuid)

    return this.findRegularSubscription(userSubscription)
  }

  private async findRegularSubscription(
    userSubscription: UserSubscription | null,
  ): Promise<FindRegularSubscriptionResponse> {
    if (userSubscription === null) {
      return {
        regularSubscription: null,
        sharedSubscription: null,
      }
    }

    if (userSubscription.subscriptionType === UserSubscriptionType.Regular) {
      return {
        regularSubscription: userSubscription,
        sharedSubscription: null,
      }
    }

    const regularSubscriptions = await this.userSubscriptionRepository.findBySubscriptionIdAndType(
      userSubscription.subscriptionId as number,
      UserSubscriptionType.Regular,
    )
    if (regularSubscriptions.length === 0) {
      return {
        regularSubscription: null,
        sharedSubscription: userSubscription,
      }
    }

    return {
      regularSubscription: regularSubscriptions[0],
      sharedSubscription: userSubscription,
    }
  }
}

import { UseCaseInterface } from '../UseCaseInterface'
import { inject, injectable } from 'inversify'
import TYPES from '../../../Bootstrap/Types'
import { GetUserOfflineSubscriptionDto } from './GetUserOfflineSubscriptionDto'
import { GetUserOfflineSubscriptionResponse } from './GetUserOfflineSubscriptionResponse'
import { OfflineUserSubscriptionRepositoryInterface } from '../../Subscription/OfflineUserSubscriptionRepositoryInterface'

@injectable()
export class GetUserOfflineSubscription implements UseCaseInterface {
  constructor(
    @inject(TYPES.Auth_OfflineUserSubscriptionRepository)
    private offlineUserSubscriptionRepository: OfflineUserSubscriptionRepositoryInterface,
  ) {}

  async execute(dto: GetUserOfflineSubscriptionDto): Promise<GetUserOfflineSubscriptionResponse> {
    const userSubscription = await this.offlineUserSubscriptionRepository.findOneByEmail(dto.userEmail)

    return {
      success: true,
      subscription: userSubscription,
    }
  }
}

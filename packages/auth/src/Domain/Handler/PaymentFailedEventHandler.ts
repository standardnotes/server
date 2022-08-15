import { AnalyticsActivity, AnalyticsStoreInterface, Period } from '@standardnotes/analytics'
import { DomainEventHandlerInterface, PaymentFailedEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'

@injectable()
export class PaymentFailedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.GetUserAnalyticsId) private getUserAnalyticsId: GetUserAnalyticsId,
    @inject(TYPES.AnalyticsStore) private analyticsStore: AnalyticsStoreInterface,
  ) {}

  async handle(event: PaymentFailedEvent): Promise<void> {
    const user = await this.userRepository.findOneByEmail(event.payload.userEmail)
    if (user === null) {
      return
    }

    const { analyticsId } = await this.getUserAnalyticsId.execute({ userUuid: user.uuid })
    await this.analyticsStore.markActivity([AnalyticsActivity.PaymentFailed], analyticsId, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])
  }
}

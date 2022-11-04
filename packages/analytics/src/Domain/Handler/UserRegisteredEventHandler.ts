import { AnalyticsActivity, AnalyticsStoreInterface, Period } from '@standardnotes/analytics'
import { DomainEventHandlerInterface, UserRegisteredEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { AnalyticsEntity } from '../Entity/AnalyticsEntity'
import { AnalyticsEntityRepositoryInterface } from '../Entity/AnalyticsEntityRepositoryInterface'

@injectable()
export class UserRegisteredEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.AnalyticsEntityRepository) private analyticsEntityRepository: AnalyticsEntityRepositoryInterface,
    @inject(TYPES.AnalyticsStore) private analyticsStore: AnalyticsStoreInterface,
  ) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    let analyticsEntity = new AnalyticsEntity()
    analyticsEntity.userUuid = event.payload.userUuid
    analyticsEntity = await this.analyticsEntityRepository.save(analyticsEntity)

    await this.analyticsStore.markActivity([AnalyticsActivity.Register], analyticsEntity.id, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])
  }
}

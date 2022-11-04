import { DomainEventHandlerInterface, UserRegisteredEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { AnalyticsActivity } from '../Analytics/AnalyticsActivity'
import { AnalyticsStoreInterface } from '../Analytics/AnalyticsStoreInterface'
import { AnalyticsEntity } from '../Entity/AnalyticsEntity'
import { AnalyticsEntityRepositoryInterface } from '../Entity/AnalyticsEntityRepositoryInterface'
import { Period } from '../Time/Period'

@injectable()
export class UserRegisteredEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.AnalyticsEntityRepository) private analyticsEntityRepository: AnalyticsEntityRepositoryInterface,
    @inject(TYPES.AnalyticsStore) private analyticsStore: AnalyticsStoreInterface,
  ) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    let analyticsEntity = new AnalyticsEntity()
    analyticsEntity.userUuid = event.payload.userUuid
    analyticsEntity.userEmail = event.payload.email
    analyticsEntity = await this.analyticsEntityRepository.save(analyticsEntity)

    await this.analyticsStore.markActivity([AnalyticsActivity.Register], analyticsEntity.id, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])
  }
}

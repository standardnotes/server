import { Result, SubscriptionPlanName, UseCaseInterface } from '@standardnotes/domain-core'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { SessionTraceRepositoryInterface } from '../../Session/SessionTraceRepositoryInterface'
import { PersistStatisticsDTO } from './PersistStatisticsDTO'

export class PersistStatistics implements UseCaseInterface<string> {
  constructor(
    private sessionTracesRepository: SessionTraceRepositoryInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
  ) {}

  async execute(dto: PersistStatisticsDTO): Promise<Result<string>> {
    const countSessionsInADay = await this.sessionTracesRepository.countByDate(dto.sessionsInADay)
    await this.domainEventPublisher.publish(
      this.domainEventFactory.createStatisticPersistenceRequestedEvent({
        statisticMeasureName: 'active-users',
        value: countSessionsInADay,
        date: dto.sessionsInADay,
      }),
    )

    const proSubscriptionPlanName = SubscriptionPlanName.create(SubscriptionPlanName.NAMES.ProPlan).getValue()
    const countProSessionsInADay = await this.sessionTracesRepository.countByDateAndSubscriptionPlanName(
      dto.sessionsInADay,
      proSubscriptionPlanName,
    )
    await this.domainEventPublisher.publish(
      this.domainEventFactory.createStatisticPersistenceRequestedEvent({
        statisticMeasureName: 'active-pro-users',
        value: countProSessionsInADay,
        date: dto.sessionsInADay,
      }),
    )

    const plusSubscriptionPlanName = SubscriptionPlanName.create(SubscriptionPlanName.NAMES.PlusPlan).getValue()
    const countPlusSessionsInADay = await this.sessionTracesRepository.countByDateAndSubscriptionPlanName(
      dto.sessionsInADay,
      plusSubscriptionPlanName,
    )
    await this.domainEventPublisher.publish(
      this.domainEventFactory.createStatisticPersistenceRequestedEvent({
        statisticMeasureName: 'active-plus-users',
        value: countPlusSessionsInADay,
        date: dto.sessionsInADay,
      }),
    )

    const countFreeSessionsInADay = countSessionsInADay - countProSessionsInADay - countPlusSessionsInADay
    await this.domainEventPublisher.publish(
      this.domainEventFactory.createStatisticPersistenceRequestedEvent({
        statisticMeasureName: 'active-free-users',
        value: countFreeSessionsInADay,
        date: dto.sessionsInADay,
      }),
    )

    return Result.ok('Statistics persisted.')
  }
}

import { Result, UseCaseInterface } from '@standardnotes/domain-core'
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

    return Result.ok('Statistics persisted.')
  }
}

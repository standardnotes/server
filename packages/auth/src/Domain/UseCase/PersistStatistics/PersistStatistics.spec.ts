import { DomainEventPublisherInterface, StatisticPersistenceRequestedEvent } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'

import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { SessionTraceRepositoryInterface } from '../../Session/SessionTraceRepositoryInterface'

import { PersistStatistics } from './PersistStatistics'

describe('PersistStatistics', () => {
  let sessionTracesRepository: SessionTraceRepositoryInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  let timer: TimerInterface

  const createUseCase = () =>
    new PersistStatistics(sessionTracesRepository, domainEventPublisher, domainEventFactory, timer)

  beforeEach(() => {
    sessionTracesRepository = {} as jest.Mocked<SessionTraceRepositoryInterface>
    sessionTracesRepository.countByDate = jest.fn().mockReturnValue(1)
    sessionTracesRepository.countByDateAndSubscriptionPlanName = jest.fn().mockReturnValue(2)

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createStatisticPersistenceRequestedEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<StatisticPersistenceRequestedEvent>)

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.convertDateToMicroseconds = jest.fn().mockReturnValue(3)
  })

  it('should request statistic persistence', async () => {
    await createUseCase().execute({ sessionsInADay: new Date() })

    expect(domainEventPublisher.publish).toHaveBeenCalledTimes(4)
  })
})

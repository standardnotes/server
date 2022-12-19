import { DomainEventPublisherInterface, StatisticPersistenceRequestedEvent } from '@standardnotes/domain-events'

import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { SessionTraceRepositoryInterface } from '../../Session/SessionTraceRepositoryInterface'

import { PersistStatistics } from './PersistStatistics'

describe('PersistStatistics', () => {
  let sessionTracesRepository: SessionTraceRepositoryInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  const createUseCase = () => new PersistStatistics(sessionTracesRepository, domainEventPublisher, domainEventFactory)

  beforeEach(() => {
    sessionTracesRepository = {} as jest.Mocked<SessionTraceRepositoryInterface>
    sessionTracesRepository.countByDate = jest.fn().mockReturnValue(1)

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createStatisticPersistenceRequestedEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<StatisticPersistenceRequestedEvent>)

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()
  })

  it('should request statistic persistence', async () => {
    await createUseCase().execute({ sessionsInADay: new Date() })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })
})

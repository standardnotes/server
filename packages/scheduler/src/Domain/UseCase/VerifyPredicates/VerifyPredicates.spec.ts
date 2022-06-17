import { DomainEventPublisherInterface, PredicateVerificationRequestedEvent } from '@standardnotes/domain-events'
import 'reflect-metadata'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { Job } from '../../Job/Job'
import { JobDoneInterpreterInterface } from '../../Job/JobDoneInterpreterInterface'
import { JobRepositoryInterface } from '../../Job/JobRepositoryInterface'
import { Predicate } from '../../Predicate/Predicate'
import { PredicateRepositoryInterface } from '../../Predicate/PredicateRepositoryInterface'
import { PredicateStatus } from '../../Predicate/PredicateStatus'

import { VerifyPredicates } from './VerifyPredicates'

describe('VerifyPredicates', () => {
  let jobRepository: JobRepositoryInterface
  let predicateRepository: PredicateRepositoryInterface
  let jobDoneInterpreter: JobDoneInterpreterInterface
  let domainEventFactory: DomainEventFactoryInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let job: Job
  let predicateComplete: Predicate
  let predicateIncomplete: Predicate

  const createUseCase = () =>
    new VerifyPredicates(
      jobRepository,
      predicateRepository,
      jobDoneInterpreter,
      domainEventFactory,
      domainEventPublisher,
    )

  beforeEach(() => {
    job = {} as jest.Mocked<Job>

    predicateComplete = {
      status: PredicateStatus.Denied,
    } as jest.Mocked<Predicate>

    predicateIncomplete = {
      status: PredicateStatus.Pending,
    } as jest.Mocked<Predicate>

    jobRepository = {} as jest.Mocked<JobRepositoryInterface>
    jobRepository.markJobAsDone = jest.fn()
    jobRepository.findPendingOverdue = jest.fn().mockReturnValue([job])

    predicateRepository = {} as jest.Mocked<PredicateRepositoryInterface>
    predicateRepository.findByJobUuid = jest.fn().mockReturnValue([predicateComplete, predicateIncomplete])

    jobDoneInterpreter = {} as jest.Mocked<JobDoneInterpreterInterface>
    jobDoneInterpreter.interpret = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createPredicateVerificationRequestedEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<PredicateVerificationRequestedEvent>)

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()
  })

  it('should request pending predicate verification on overdue jobs', async () => {
    await createUseCase().execute({ timestamp: 123 })

    expect(domainEventPublisher.publish).toHaveBeenCalledTimes(1)
    expect(jobDoneInterpreter.interpret).not.toHaveBeenCalled()
    expect(jobRepository.markJobAsDone).not.toHaveBeenCalled()
  })

  it('should mark overdue jobs as complete if there are no predicates for them', async () => {
    predicateRepository.findByJobUuid = jest.fn().mockReturnValue([])

    await createUseCase().execute({ timestamp: 123 })

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
    expect(jobDoneInterpreter.interpret).toHaveBeenCalled()
    expect(jobRepository.markJobAsDone).toHaveBeenCalled()
  })
})

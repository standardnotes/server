import {
  DiscountApplyRequestedEvent,
  DiscountWithdrawRequestedEvent,
  DomainEventPublisherInterface,
  EmailMessageRequestedEvent,
} from '@standardnotes/domain-events'
import { PredicateName } from '@standardnotes/predicates'
import 'reflect-metadata'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { Predicate } from '../Predicate/Predicate'
import { PredicateRepositoryInterface } from '../Predicate/PredicateRepositoryInterface'
import { PredicateStatus } from '../Predicate/PredicateStatus'

import { Job } from './Job'

import { JobDoneInterpreter } from './JobDoneInterpreter'
import { JobName } from './JobName'
import { JobRepositoryInterface } from './JobRepositoryInterface'

describe('JobDoneInterpreter', () => {
  let jobRepository: JobRepositoryInterface
  let predicateRepository: PredicateRepositoryInterface
  let domainEventFactory: DomainEventFactoryInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let job: Job

  const createInterpreter = () =>
    new JobDoneInterpreter(jobRepository, predicateRepository, domainEventFactory, domainEventPublisher)

  beforeEach(() => {
    job = {} as jest.Mocked<Job>

    jobRepository = {} as jest.Mocked<JobRepositoryInterface>
    jobRepository.findOneByUuid = jest.fn().mockReturnValue(job)

    predicateRepository = {} as jest.Mocked<PredicateRepositoryInterface>
    predicateRepository.findByJobUuid = jest.fn().mockReturnValue([])

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createEmailMessageRequestedEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<EmailMessageRequestedEvent>)
    domainEventFactory.createDiscountApplyRequestedEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<DiscountApplyRequestedEvent>)
    domainEventFactory.createDiscountWithdrawRequestedEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<DiscountWithdrawRequestedEvent>)

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()
  })

  it('should do nothing if job is not found', async () => {
    jobRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    let error = null
    try {
      await createInterpreter().interpret('1-2-3')
    } catch (caughtError) {
      error = caughtError
    }

    expect(error).toBeNull()
  })

  it('should request email backup encouraging email', async () => {
    jobRepository.findOneByUuid = jest.fn().mockReturnValue({
      name: JobName.ENCOURAGE_EMAIL_BACKUPS,
      userIdentifier: 'test@test.te',
      userIdentifierType: 'email',
    } as jest.Mocked<Job>)
    predicateRepository.findByJobUuid = jest
      .fn()
      .mockReturnValue([
        { name: PredicateName.EmailBackupsEnabled, status: PredicateStatus.Denied } as jest.Mocked<Predicate>,
      ])

    await createInterpreter().interpret('1-2-3')

    expect(domainEventFactory.createEmailMessageRequestedEvent).toHaveBeenCalledWith({
      context: {},
      messageIdentifier: 'ENCOURAGE_EMAIL_BACKUPS',
      userEmail: 'test@test.te',
    })
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should not request action if predicates are not met', async () => {
    jobRepository.findOneByUuid = jest.fn().mockReturnValue({
      name: JobName.ENCOURAGE_EMAIL_BACKUPS,
      userIdentifier: 'test@test.te',
      userIdentifierType: 'email',
    } as jest.Mocked<Job>)
    predicateRepository.findByJobUuid = jest
      .fn()
      .mockReturnValue([
        { name: PredicateName.EmailBackupsEnabled, status: PredicateStatus.Affirmed } as jest.Mocked<Predicate>,
      ])

    await createInterpreter().interpret('1-2-3')

    expect(domainEventFactory.createEmailMessageRequestedEvent).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should not request email backup encouraging email if email is missing', async () => {
    jobRepository.findOneByUuid = jest.fn().mockReturnValue({
      name: JobName.ENCOURAGE_EMAIL_BACKUPS,
      userIdentifier: '2-3-4',
      userIdentifierType: 'uuid',
    } as jest.Mocked<Job>)

    await createInterpreter().interpret('1-2-3')

    expect(domainEventFactory.createEmailMessageRequestedEvent).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should request subscription purchasing encouraging email', async () => {
    jobRepository.findOneByUuid = jest.fn().mockReturnValue({
      name: JobName.ENCOURAGE_SUBSCRIPTION_PURCHASING,
      userIdentifier: 'test@test.te',
      userIdentifierType: 'email',
      createdAt: 123,
    } as jest.Mocked<Job>)
    predicateRepository.findByJobUuid = jest
      .fn()
      .mockReturnValue([
        { name: PredicateName.SubscriptionPurchased, status: PredicateStatus.Denied } as jest.Mocked<Predicate>,
      ])

    await createInterpreter().interpret('1-2-3')

    expect(domainEventFactory.createEmailMessageRequestedEvent).toHaveBeenCalledWith({
      context: { userRegisteredAt: 123 },
      messageIdentifier: 'ENCOURAGE_SUBSCRIPTION_PURCHASING',
      userEmail: 'test@test.te',
    })
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should not request subscription purchasing encouraging email if email is missing', async () => {
    jobRepository.findOneByUuid = jest.fn().mockReturnValue({
      name: JobName.ENCOURAGE_SUBSCRIPTION_PURCHASING,
      userIdentifier: '2-3-4',
      userIdentifierType: 'uuid',
    } as jest.Mocked<Job>)

    await createInterpreter().interpret('1-2-3')

    expect(domainEventFactory.createEmailMessageRequestedEvent).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should request exit interview email', async () => {
    jobRepository.findOneByUuid = jest.fn().mockReturnValue({
      name: JobName.EXIT_INTERVIEW,
      userIdentifier: 'test@test.te',
      userIdentifierType: 'email',
    } as jest.Mocked<Job>)

    await createInterpreter().interpret('1-2-3')

    expect(domainEventFactory.createEmailMessageRequestedEvent).toHaveBeenCalledWith({
      context: {},
      messageIdentifier: 'EXIT_INTERVIEW',
      userEmail: 'test@test.te',
    })
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should not request exit interview email if email is missing', async () => {
    jobRepository.findOneByUuid = jest.fn().mockReturnValue({
      name: JobName.EXIT_INTERVIEW,
      userIdentifier: '2-3-4',
      userIdentifierType: 'uuid',
    } as jest.Mocked<Job>)

    await createInterpreter().interpret('1-2-3')

    expect(domainEventFactory.createEmailMessageRequestedEvent).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should request discount apply', async () => {
    jobRepository.findOneByUuid = jest.fn().mockReturnValue({
      name: JobName.APPLY_SUBSCRIPTION_DISCOUNT,
      userIdentifier: 'test@standardnotes.com',
      userIdentifierType: 'email',
    } as jest.Mocked<Job>)

    await createInterpreter().interpret('1-2-3')

    expect(domainEventFactory.createDiscountApplyRequestedEvent).toHaveBeenCalledWith({
      userEmail: 'test@standardnotes.com',
      discountCode: 'econ-10',
    })
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should not request discount apply if email is not internal', async () => {
    jobRepository.findOneByUuid = jest.fn().mockReturnValue({
      name: JobName.APPLY_SUBSCRIPTION_DISCOUNT,
      userIdentifier: 'test@test.com',
      userIdentifierType: 'email',
    } as jest.Mocked<Job>)

    await createInterpreter().interpret('1-2-3')

    expect(domainEventFactory.createDiscountApplyRequestedEvent).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should not request discount apply if email is missing', async () => {
    jobRepository.findOneByUuid = jest.fn().mockReturnValue({
      name: JobName.APPLY_SUBSCRIPTION_DISCOUNT,
      userIdentifier: '2-3-4',
      userIdentifierType: 'uuid',
    } as jest.Mocked<Job>)

    await createInterpreter().interpret('1-2-3')

    expect(domainEventFactory.createDiscountApplyRequestedEvent).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should request discount withdraw', async () => {
    jobRepository.findOneByUuid = jest.fn().mockReturnValue({
      name: JobName.WITHDRAW_SUBSCRIPTION_DISCOUNT,
      userIdentifier: 'test@standardnotes.com',
      userIdentifierType: 'email',
    } as jest.Mocked<Job>)

    await createInterpreter().interpret('1-2-3')

    expect(domainEventFactory.createDiscountWithdrawRequestedEvent).toHaveBeenCalledWith({
      userEmail: 'test@standardnotes.com',
      discountCode: 'econ-10',
    })
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should not request discount withdraw if email is not internal', async () => {
    jobRepository.findOneByUuid = jest.fn().mockReturnValue({
      name: JobName.WITHDRAW_SUBSCRIPTION_DISCOUNT,
      userIdentifier: 'test@test.com',
      userIdentifierType: 'email',
    } as jest.Mocked<Job>)

    await createInterpreter().interpret('1-2-3')

    expect(domainEventFactory.createDiscountWithdrawRequestedEvent).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should not request discount withdraw if email is missing', async () => {
    jobRepository.findOneByUuid = jest.fn().mockReturnValue({
      name: JobName.WITHDRAW_SUBSCRIPTION_DISCOUNT,
      userIdentifier: '2-3-4',
      userIdentifierType: 'uuid',
    } as jest.Mocked<Job>)

    await createInterpreter().interpret('1-2-3')

    expect(domainEventFactory.createDiscountWithdrawRequestedEvent).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should do nothing if there is no interpretation for a given job', async () => {
    jobRepository.findOneByUuid = jest.fn().mockReturnValue({
      name: 'foobar' as JobName,
      userIdentifier: 'test@test.te',
      userIdentifierType: 'email',
    } as jest.Mocked<Job>)

    await createInterpreter().interpret('1-2-3')

    expect(domainEventFactory.createEmailMessageRequestedEvent).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })
})

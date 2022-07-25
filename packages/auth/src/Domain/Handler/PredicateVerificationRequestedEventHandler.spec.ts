import 'reflect-metadata'

import {
  DomainEventPublisherInterface,
  DomainEventService,
  PredicateVerificationRequestedEvent,
  PredicateVerificationRequestedEventPayload,
  PredicateVerifiedEvent,
} from '@standardnotes/domain-events'
import { Predicate, PredicateVerificationResult } from '@standardnotes/predicates'
import { Logger } from 'winston'

import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { VerifyPredicate } from '../UseCase/VerifyPredicate/VerifyPredicate'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'

import { PredicateVerificationRequestedEventHandler } from './PredicateVerificationRequestedEventHandler'
import { User } from '../User/User'

describe('PredicateVerificationRequestedEventHandler', () => {
  let verifyPredicate: VerifyPredicate
  let userRepository: UserRepositoryInterface
  let domainEventFactory: DomainEventFactoryInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let logger: Logger
  let event: PredicateVerificationRequestedEvent

  const createHandler = () =>
    new PredicateVerificationRequestedEventHandler(
      verifyPredicate,
      userRepository,
      domainEventFactory,
      domainEventPublisher,
      logger,
    )

  beforeEach(() => {
    verifyPredicate = {} as jest.Mocked<VerifyPredicate>
    verifyPredicate.execute = jest
      .fn()
      .mockReturnValue({ predicateVerificationResult: PredicateVerificationResult.Affirmed })

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByEmail = jest.fn().mockReturnValue({ uuid: '1-2-3' } as jest.Mocked<User>)

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createPredicateVerifiedEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<PredicateVerifiedEvent>)

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    logger = {} as jest.Mocked<Logger>
    logger.warn = jest.fn()
    logger.info = jest.fn()

    event = {} as jest.Mocked<PredicateVerificationRequestedEvent>
    event.meta = {
      correlation: {
        userIdentifier: '2-3-4',
        userIdentifierType: 'uuid',
      },
      origin: DomainEventService.Auth,
    }
    event.payload = {
      predicate: {} as jest.Mocked<Predicate>,
    } as jest.Mocked<PredicateVerificationRequestedEventPayload>
  })

  it('should verify a predicate by user uuid', async () => {
    await createHandler().handle(event)

    expect(verifyPredicate.execute).toHaveBeenCalledWith({
      predicate: event.payload.predicate,
      userUuid: '2-3-4',
    })
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should verify a predicate by user uuid', async () => {
    event.meta = {
      correlation: {
        userIdentifier: 'test@test.te',
        userIdentifierType: 'email',
      },
      origin: DomainEventService.Auth,
    }

    await createHandler().handle(event)

    expect(verifyPredicate.execute).toHaveBeenCalledWith({
      predicate: event.payload.predicate,
      userUuid: '1-2-3',
    })
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should mark a predicate verification with undetermined result if user is missing', async () => {
    event.meta = {
      correlation: {
        userIdentifier: 'test@test.te',
        userIdentifierType: 'email',
      },
      origin: DomainEventService.Auth,
    }

    userRepository.findOneByEmail = jest.fn().mockReturnValue(null)

    await createHandler().handle(event)

    expect(verifyPredicate.execute).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })
})

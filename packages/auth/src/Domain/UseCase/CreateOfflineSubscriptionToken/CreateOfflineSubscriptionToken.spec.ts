import 'reflect-metadata'

import { CryptoNode } from '@standardnotes/sncrypto-node'
import { TimerInterface } from '@standardnotes/time'
import { OfflineSubscriptionTokenRepositoryInterface } from '../../Auth/OfflineSubscriptionTokenRepositoryInterface'

import { CreateOfflineSubscriptionToken } from './CreateOfflineSubscriptionToken'
import { DomainEventPublisherInterface, EmailRequestedEvent } from '@standardnotes/domain-events'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { OfflineUserSubscriptionRepositoryInterface } from '../../Subscription/OfflineUserSubscriptionRepositoryInterface'
import { OfflineUserSubscription } from '../../Subscription/OfflineUserSubscription'
import { Logger } from 'winston'

describe('CreateOfflineSubscriptionToken', () => {
  let offlineSubscriptionTokenRepository: OfflineSubscriptionTokenRepositoryInterface
  let offlineUserSubscriptionRepository: OfflineUserSubscriptionRepositoryInterface
  let cryptoNode: CryptoNode
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface
  let timer: TimerInterface
  let logger: Logger

  const createUseCase = () =>
    new CreateOfflineSubscriptionToken(
      offlineSubscriptionTokenRepository,
      offlineUserSubscriptionRepository,
      cryptoNode,
      domainEventPublisher,
      domainEventFactory,
      timer,
      logger,
    )

  beforeEach(() => {
    offlineSubscriptionTokenRepository = {} as jest.Mocked<OfflineSubscriptionTokenRepositoryInterface>
    offlineSubscriptionTokenRepository.save = jest.fn()

    offlineUserSubscriptionRepository = {} as jest.Mocked<OfflineUserSubscriptionRepositoryInterface>
    offlineUserSubscriptionRepository.findOneByEmail = jest
      .fn()
      .mockReturnValue({ cancelled: false, endsAt: 100 } as jest.Mocked<OfflineUserSubscription>)

    cryptoNode = {} as jest.Mocked<CryptoNode>
    cryptoNode.generateRandomKey = jest.fn().mockReturnValueOnce('random-string')

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createEmailRequestedEvent = jest.fn().mockReturnValue({} as jest.Mocked<EmailRequestedEvent>)

    timer = {} as jest.Mocked<TimerInterface>
    timer.convertStringDateToMicroseconds = jest.fn().mockReturnValue(1)
    timer.getUTCDateNHoursAhead = jest.fn().mockReturnValue(new Date(1))
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(3)

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
  })

  it('should create an offline subscription token and persist it', async () => {
    await createUseCase().execute({
      userEmail: 'test@test.com',
    })

    expect(offlineSubscriptionTokenRepository.save).toHaveBeenCalledWith({
      userEmail: 'test@test.com',
      token: 'random-string',
      expiresAt: 1,
    })

    expect(domainEventFactory.createEmailRequestedEvent).toHaveBeenCalled()
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('should not create an offline subscription token if email has no offline subscription', async () => {
    offlineUserSubscriptionRepository.findOneByEmail = jest.fn().mockReturnValue(null)

    expect(
      await createUseCase().execute({
        userEmail: 'test@test.com',
      }),
    ).toEqual({
      success: false,
      error: 'no-subscription',
    })

    expect(offlineSubscriptionTokenRepository.save).not.toHaveBeenCalled()
    expect(domainEventFactory.createEmailRequestedEvent).not.toHaveBeenCalled()
    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })
})

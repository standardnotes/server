import 'reflect-metadata'

import { DomainEventPublisherInterface, ExitDiscountApplyRequestedEvent } from '@standardnotes/domain-events'
import { UserRequestType } from '@standardnotes/common'

import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { UserSubscription } from '../../Subscription/UserSubscription'
import { UserSubscriptionRepositoryInterface } from '../../Subscription/UserSubscriptionRepositoryInterface'

import { ProcessUserRequest } from './ProcessUserRequest'

describe('ProcessUserRequest', () => {
  let userSubscriptionRepository: UserSubscriptionRepositoryInterface
  let domainEventFactory: DomainEventFactoryInterface
  let domainEventPublisher: DomainEventPublisherInterface

  const createUseCase = () =>
    new ProcessUserRequest(userSubscriptionRepository, domainEventFactory, domainEventPublisher)

  beforeEach(() => {
    userSubscriptionRepository = {} as jest.Mocked<UserSubscriptionRepositoryInterface>
    userSubscriptionRepository.findOneByUserUuid = jest.fn().mockReturnValue({
      cancelled: true,
    } as jest.Mocked<UserSubscription>)

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createExitDiscountApplyRequestedEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<ExitDiscountApplyRequestedEvent>)

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()
  })

  it('should not process unsupported requests', async () => {
    expect(
      await createUseCase().execute({
        userEmail: 'test@test.te',
        userUuid: '1-2-3',
        requestType: 'foobar' as UserRequestType,
      }),
    ).toEqual({
      success: false,
    })

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should not process uncancelled subscriptions', async () => {
    userSubscriptionRepository.findOneByUserUuid = jest.fn().mockReturnValue({} as jest.Mocked<UserSubscription>)

    expect(
      await createUseCase().execute({
        userEmail: 'test@test.te',
        userUuid: '1-2-3',
        requestType: UserRequestType.ExitDiscount,
      }),
    ).toEqual({
      success: false,
    })

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should not process non existing subscriptions', async () => {
    userSubscriptionRepository.findOneByUserUuid = jest.fn().mockReturnValue(null)

    expect(
      await createUseCase().execute({
        userEmail: 'test@test.te',
        userUuid: '1-2-3',
        requestType: UserRequestType.ExitDiscount,
      }),
    ).toEqual({
      success: false,
    })

    expect(domainEventPublisher.publish).not.toHaveBeenCalled()
  })

  it('should publish an exit discount apply requested event', async () => {
    expect(
      await createUseCase().execute({
        userEmail: 'test@test.te',
        userUuid: '1-2-3',
        requestType: UserRequestType.ExitDiscount,
      }),
    ).toEqual({
      success: true,
    })

    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })
})

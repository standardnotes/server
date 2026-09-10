import 'reflect-metadata'

import { DomainEventPublisherInterface, ExitDiscountApplyRequestedEvent } from '@standardnotes/domain-events'
import { UserRequestType } from '@standardnotes/common'

import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { UserSubscription } from '../../Subscription/UserSubscription'
import { SelectValidUserSubscription } from '../SelectValidUserSubscription/SelectValidUserSubscription'

import { ProcessUserRequest } from './ProcessUserRequest'

describe('ProcessUserRequest', () => {
  let selectValidUserSubscription: SelectValidUserSubscription
  let domainEventFactory: DomainEventFactoryInterface
  let domainEventPublisher: DomainEventPublisherInterface

  const createUseCase = () =>
    new ProcessUserRequest(selectValidUserSubscription, domainEventFactory, domainEventPublisher)

  beforeEach(() => {
    selectValidUserSubscription = {} as jest.Mocked<SelectValidUserSubscription>
    selectValidUserSubscription.execute = jest.fn().mockReturnValue({
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
    selectValidUserSubscription.execute = jest.fn().mockReturnValue({} as jest.Mocked<UserSubscription>)

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
    selectValidUserSubscription.execute = jest.fn().mockReturnValue(null)

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

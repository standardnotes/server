import { DomainEventPublisherInterface, ListedAccountRequestedEvent } from '@standardnotes/domain-events'
import 'reflect-metadata'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'

import { CreateListedAccount } from './CreateListedAccount'

describe('CreateListedAccount', () => {
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface

  const createUseCase = () => new CreateListedAccount(domainEventPublisher, domainEventFactory)

  beforeEach(() => {
    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createListedAccountRequestedEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<ListedAccountRequestedEvent>)
  })

  it('should publish a listed account requested event', async () => {
    await createUseCase().execute({ userUuid: '1-2-3', userEmail: 'test@test.com' })

    expect(domainEventFactory.createListedAccountRequestedEvent).toHaveBeenCalledWith('1-2-3', 'test@test.com')
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })
})

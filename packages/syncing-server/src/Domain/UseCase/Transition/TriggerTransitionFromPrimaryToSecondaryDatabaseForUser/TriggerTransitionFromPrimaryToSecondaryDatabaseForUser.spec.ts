import { DomainEventPublisherInterface } from '@standardnotes/domain-events'

import { TriggerTransitionFromPrimaryToSecondaryDatabaseForUser } from './TriggerTransitionFromPrimaryToSecondaryDatabaseForUser'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'

describe('TriggerTransitionFromPrimaryToSecondaryDatabaseForUser', () => {
  let domainEventPubliser: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface

  const createUseCase = () =>
    new TriggerTransitionFromPrimaryToSecondaryDatabaseForUser(domainEventPubliser, domainEventFactory)

  beforeEach(() => {
    domainEventPubliser = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPubliser.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createTransitionStatusUpdatedEvent = jest.fn()
  })

  it('should publish transition status updated event', async () => {
    const useCase = createUseCase()

    await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(domainEventPubliser.publish).toHaveBeenCalled()
  })
})

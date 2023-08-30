import { Result, UseCaseInterface } from '@standardnotes/domain-core'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'

import { TriggerTransitionFromPrimaryToSecondaryDatabaseForUserDTO } from './TriggerTransitionFromPrimaryToSecondaryDatabaseForUserDTO'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'

export class TriggerTransitionFromPrimaryToSecondaryDatabaseForUser implements UseCaseInterface<void> {
  constructor(
    private domainEventPubliser: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
  ) {}

  async execute(dto: TriggerTransitionFromPrimaryToSecondaryDatabaseForUserDTO): Promise<Result<void>> {
    const event = this.domainEventFactory.createTransitionStatusUpdatedEvent({
      userUuid: dto.userUuid,
      status: 'STARTED',
      transitionType: 'items',
    })

    await this.domainEventPubliser.publish(event)

    return Result.ok()
  }
}

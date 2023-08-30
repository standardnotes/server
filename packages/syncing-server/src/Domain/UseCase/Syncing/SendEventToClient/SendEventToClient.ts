import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'

import { SendEventToClientDTO } from './SendEventToClientDTO'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'

export class SendEventToClient implements UseCaseInterface<void> {
  constructor(
    private domainEventFactory: DomainEventFactoryInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
  ) {}

  async execute(dto: SendEventToClientDTO): Promise<Result<void>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const event = this.domainEventFactory.createWebSocketMessageRequestedEvent({
      userUuid: userUuid.value,
      message: JSON.stringify(dto.event),
    })

    await this.domainEventPublisher.publish(event)

    return Result.ok()
  }
}

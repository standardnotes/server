import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'

import { SendEventToClientDTO } from './SendEventToClientDTO'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'
import { Logger } from 'winston'

export class SendEventToClient implements UseCaseInterface<void> {
  constructor(
    private domainEventFactory: DomainEventFactoryInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
    private logger: Logger,
  ) {}

  async execute(dto: SendEventToClientDTO): Promise<Result<void>> {
    try {
      const userUuidOrError = Uuid.create(dto.userUuid)
      if (userUuidOrError.isFailed()) {
        return Result.fail(userUuidOrError.getError())
      }
      const userUuid = userUuidOrError.getValue()

      this.logger.debug(`[WebSockets] Requesting message ${dto.event.type} to user ${dto.userUuid}`)

      const event = this.domainEventFactory.createWebSocketMessageRequestedEvent({
        userUuid: userUuid.value,
        message: JSON.stringify(dto.event),
        originatingSessionUuid: dto.originatingSessionUuid,
      })

      await this.domainEventPublisher.publish(event)

      return Result.ok()
    } catch (error) {
      return Result.fail(`Failed to send event to client: ${(error as Error).message}`)
    }
  }
}

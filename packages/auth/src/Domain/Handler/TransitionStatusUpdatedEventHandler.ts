import { DomainEventHandlerInterface, TransitionStatusUpdatedEvent } from '@standardnotes/domain-events'
import { UpdateTransitionStatus } from '../UseCase/UpdateTransitionStatus/UpdateTransitionStatus'
import { Logger } from 'winston'

export class TransitionStatusUpdatedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private updateTransitionStatusUseCase: UpdateTransitionStatus,
    private logger: Logger,
  ) {}

  async handle(event: TransitionStatusUpdatedEvent): Promise<void> {
    const result = await this.updateTransitionStatusUseCase.execute({
      status: event.payload.status,
      userUuid: event.payload.userUuid,
      transitionType: event.payload.transitionType,
      transitionTimestamp: event.payload.transitionTimestamp,
    })

    if (result.isFailed()) {
      this.logger.error(`Failed to update transition status for user ${event.payload.userUuid}`)
    }
  }
}

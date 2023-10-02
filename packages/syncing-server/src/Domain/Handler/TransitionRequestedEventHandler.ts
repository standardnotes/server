import { DomainEventHandlerInterface, TransitionRequestedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { TransitionItemsFromPrimaryToSecondaryDatabaseForUser } from '../UseCase/Transition/TransitionItemsFromPrimaryToSecondaryDatabaseForUser/TransitionItemsFromPrimaryToSecondaryDatabaseForUser'

export class TransitionRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private disabled: boolean,
    private transitionItemsFromPrimaryToSecondaryDatabaseForUser: TransitionItemsFromPrimaryToSecondaryDatabaseForUser,
    private logger: Logger,
  ) {}

  async handle(event: TransitionRequestedEvent): Promise<void> {
    if (this.disabled) {
      return
    }

    if (event.payload.type !== 'items') {
      return
    }

    const result = await this.transitionItemsFromPrimaryToSecondaryDatabaseForUser.execute({
      userUuid: event.payload.userUuid,
      timestamp: event.payload.timestamp,
    })

    if (result.isFailed()) {
      this.logger.error(`[${event.payload.userUuid}] Failed to trigger transition: ${result.getError()}`)
    }
  }
}

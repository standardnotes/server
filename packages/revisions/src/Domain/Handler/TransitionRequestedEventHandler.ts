import { DomainEventHandlerInterface, TransitionRequestedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser } from '../UseCase/Transition/TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser/TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser'

export class TransitionRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private disabled: boolean,
    private transitionRevisionsFromPrimaryToSecondaryDatabaseForUser: TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser,
    private logger: Logger,
  ) {}

  async handle(event: TransitionRequestedEvent): Promise<void> {
    if (this.disabled) {
      return
    }

    if (event.payload.type !== 'revisions') {
      return
    }

    const result = await this.transitionRevisionsFromPrimaryToSecondaryDatabaseForUser.execute({
      userUuid: event.payload.userUuid,
      timestamp: event.payload.timestamp,
    })

    if (result.isFailed()) {
      this.logger.error(`[${event.payload.userUuid}] Failed to transition: ${result.getError()}`)
    }
  }
}

import { DomainEventHandlerInterface, EmailSubscriptionUnsubscribedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { DisableEmailSettingBasedOnEmailSubscription } from '../UseCase/DisableEmailSettingBasedOnEmailSubscription/DisableEmailSettingBasedOnEmailSubscription'

export class EmailSubscriptionUnsubscribedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private disableEmailSettingBasedOnEmailSubscription: DisableEmailSettingBasedOnEmailSubscription,
    private logger: Logger,
  ) {}

  async handle(event: EmailSubscriptionUnsubscribedEvent): Promise<void> {
    const result = await this.disableEmailSettingBasedOnEmailSubscription.execute({
      userEmail: event.payload.userEmail,
      level: event.payload.level,
    })

    if (result.isFailed()) {
      this.logger.error(`Failed to disable email setting for user: ${result.getError()}`, {
        userId: event.payload.userEmail,
      })
    }
  }
}

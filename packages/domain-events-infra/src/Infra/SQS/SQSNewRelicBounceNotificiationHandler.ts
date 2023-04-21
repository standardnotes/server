import { Logger } from 'winston'
import * as newrelic from 'newrelic'

import {
  DomainEventHandlerInterface,
  DomainEventMessageHandlerInterface,
  DomainEventService,
  EmailBouncedEvent,
} from '@standardnotes/domain-events'

export class SQSNewRelicBounceNotificiationHandler implements DomainEventMessageHandlerInterface {
  private readonly ALLOWED_NOTIFICATION_TYPES = ['Bounce']

  constructor(private handlers: Map<string, DomainEventHandlerInterface>, private logger: Logger) {}

  async handleMessage(message: string): Promise<void> {
    const messageParsed = JSON.parse(JSON.parse(message).Message)

    if (!this.ALLOWED_NOTIFICATION_TYPES.includes(messageParsed.notificationType)) {
      this.logger.error(`Received notification of type ${messageParsed.notificationType} which is not allowed`)

      return
    }

    for (const bouncedRecipient of messageParsed.bounce.bouncedRecipients) {
      const domainEvent: EmailBouncedEvent = {
        type: 'EMAIL_BOUNCED',
        payload: {
          bounceType: messageParsed.bounce.bounceType,
          bounceSubType: messageParsed.bounce.bounceSubType,
          recipientEmail: bouncedRecipient.emailAddress,
          diagnosticCode: bouncedRecipient.diagnosticCode,
        },
        createdAt: new Date(),
        meta: {
          correlation: {
            userIdentifier: bouncedRecipient.emailAddress,
            userIdentifierType: 'email',
          },
          origin: DomainEventService.SES,
        },
      }

      const handler = this.handlers.get(domainEvent.type)
      if (!handler) {
        this.logger.debug(`Event handler for event type ${domainEvent.type} does not exist`)

        return
      }

      this.logger.debug(`Received event: ${domainEvent.type}`)

      await newrelic.startBackgroundTransaction(
        domainEvent.type,
        /* istanbul ignore next */
        () => {
          newrelic.getTransaction()

          return handler.handle(domainEvent)
        },
      )
    }
  }

  async handleError(error: Error): Promise<void> {
    this.logger.error('Error occured while handling SQS message: %O', error)
  }
}

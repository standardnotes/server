import { DomainEventHandlerInterface, FileQuotaRecalculationRequestedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { RecalculateQuota } from '../UseCase/RecalculateQuota/RecalculateQuota'

export class FileQuotaRecalculationRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private recalculateQuota: RecalculateQuota,
    private logger: Logger,
  ) {}

  async handle(event: FileQuotaRecalculationRequestedEvent): Promise<void> {
    this.logger.info('Recalculating quota for user...', {
      userId: event.payload.userUuid,
    })

    const result = await this.recalculateQuota.execute({
      userUuid: event.payload.userUuid,
    })

    if (result.isFailed()) {
      this.logger.error('Could not recalculate quota', {
        userId: event.payload.userUuid,
      })

      return
    }

    this.logger.info('Quota recalculated', {
      userId: event.payload.userUuid,
    })
  }
}

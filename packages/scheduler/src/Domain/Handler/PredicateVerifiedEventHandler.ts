import { PredicateVerifiedEvent, DomainEventHandlerInterface } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { UpdatePredicateStatus } from '../UseCase/UpdatePredicateStatus/UpdatePredicateStatus'

@injectable()
export class PredicateVerifiedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.UpdatePredicateStatus) private updatePredicateStatus: UpdatePredicateStatus,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async handle(event: PredicateVerifiedEvent): Promise<void> {
    this.logger.debug(
      `Updating predicate ${event.payload.predicate.name} for job ${event.payload.predicate.jobUuid} with status ${event.payload.predicateVerificationResult}`,
    )

    await this.updatePredicateStatus.execute(event.payload)
  }
}

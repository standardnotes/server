import {
  DomainEventHandlerInterface,
  DomainEventPublisherInterface,
  PredicateVerificationRequestedEvent,
} from '@standardnotes/domain-events'
import { PredicateVerificationResult } from '@standardnotes/predicates'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { VerifyPredicate } from '../UseCase/VerifyPredicate/VerifyPredicate'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'

@injectable()
export class PredicateVerificationRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.VerifyPredicate) private verifyPredicate: VerifyPredicate,
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async handle(event: PredicateVerificationRequestedEvent): Promise<void> {
    this.logger.info(`Received verification request of predicate: ${event.payload.predicate.name}`)

    let userUuid = event.meta.correlation.userIdentifier
    if (event.meta.correlation.userIdentifierType === 'email') {
      const user = await this.userRepository.findOneByEmail(event.meta.correlation.userIdentifier)
      if (user === null) {
        await this.domainEventPublisher.publish(
          this.domainEventFactory.createPredicateVerifiedEvent({
            predicate: event.payload.predicate,
            predicateVerificationResult: PredicateVerificationResult.CouldNotBeDetermined,
            userUuid,
          }),
        )

        return
      }
      userUuid = user.uuid
    }

    const { predicateVerificationResult } = await this.verifyPredicate.execute({
      predicate: event.payload.predicate,
      userUuid,
    })

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createPredicateVerifiedEvent({
        predicate: event.payload.predicate,
        predicateVerificationResult,
        userUuid,
      }),
    )

    this.logger.info(
      `Published predicate verification (${predicateVerificationResult}) result for: ${event.payload.predicate.name}`,
    )
  }
}

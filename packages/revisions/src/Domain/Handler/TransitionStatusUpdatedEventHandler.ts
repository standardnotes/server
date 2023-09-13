import {
  DomainEventHandlerInterface,
  DomainEventPublisherInterface,
  TransitionStatusUpdatedEvent,
} from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser } from '../UseCase/Transition/TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser/TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser'
import { Uuid } from '@standardnotes/domain-core'
import { RevisionRepositoryInterface } from '../Revision/RevisionRepositoryInterface'

export class TransitionStatusUpdatedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private primaryRevisionsRepository: RevisionRepositoryInterface,
    private transitionRevisionsFromPrimaryToSecondaryDatabaseForUser: TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser,
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private logger: Logger,
  ) {}

  async handle(event: TransitionStatusUpdatedEvent): Promise<void> {
    if (event.payload.status === 'STARTED' && event.payload.transitionType === 'items') {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createTransitionStatusUpdatedEvent({
          userUuid: event.payload.userUuid,
          status: 'STARTED',
          transitionType: 'revisions',
        }),
      )

      return
    }

    if (event.payload.status === 'STARTED' && event.payload.transitionType === 'revisions') {
      const userUuidOrError = Uuid.create(event.payload.userUuid)
      if (userUuidOrError.isFailed()) {
        this.logger.error(
          `Failed to transition revisions for user ${event.payload.userUuid}: ${userUuidOrError.getError()}`,
        )
        await this.domainEventPublisher.publish(
          this.domainEventFactory.createTransitionStatusUpdatedEvent({
            userUuid: event.payload.userUuid,
            status: 'FAILED',
            transitionType: 'revisions',
          }),
        )

        return
      }

      if (await this.isAlreadyMigrated(userUuidOrError.getValue())) {
        await this.domainEventPublisher.publish(
          this.domainEventFactory.createTransitionStatusUpdatedEvent({
            userUuid: event.payload.userUuid,
            status: 'FINISHED',
            transitionType: 'revisions',
          }),
        )

        return
      }

      await this.domainEventPublisher.publish(
        this.domainEventFactory.createTransitionStatusUpdatedEvent({
          userUuid: event.payload.userUuid,
          status: 'IN_PROGRESS',
          transitionType: 'revisions',
        }),
      )

      const result = await this.transitionRevisionsFromPrimaryToSecondaryDatabaseForUser.execute({
        userUuid: event.payload.userUuid,
      })

      if (result.isFailed()) {
        this.logger.error(`Failed to transition revisions for user ${event.payload.userUuid}: ${result.getError()}`)

        await this.domainEventPublisher.publish(
          this.domainEventFactory.createTransitionStatusUpdatedEvent({
            userUuid: event.payload.userUuid,
            status: 'FAILED',
            transitionType: 'revisions',
          }),
        )

        return
      }

      await this.domainEventPublisher.publish(
        this.domainEventFactory.createTransitionStatusUpdatedEvent({
          userUuid: event.payload.userUuid,
          status: 'FINISHED',
          transitionType: 'revisions',
        }),
      )

      return
    }
  }

  private async isAlreadyMigrated(userUuid: Uuid): Promise<boolean> {
    const totalRevisionsCountForUserInPrimary = await this.primaryRevisionsRepository.countByUserUuid(userUuid)

    if (totalRevisionsCountForUserInPrimary > 0) {
      this.logger.info(
        `User ${userUuid.value} has ${totalRevisionsCountForUserInPrimary} revisions in primary database.`,
      )
    }

    return totalRevisionsCountForUserInPrimary === 0
  }
}

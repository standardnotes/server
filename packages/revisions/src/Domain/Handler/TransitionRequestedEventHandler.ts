import {
  DomainEventHandlerInterface,
  DomainEventPublisherInterface,
  TransitionRequestedEvent,
} from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser } from '../UseCase/Transition/TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser/TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { RevisionRepositoryInterface } from '../Revision/RevisionRepositoryInterface'
import { TransitionStatus, Uuid } from '@standardnotes/domain-core'

export class TransitionRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private transitionRevisionsFromPrimaryToSecondaryDatabaseForUser: TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser,
    private primaryRevisionsRepository: RevisionRepositoryInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private logger: Logger,
  ) {}

  async handle(event: TransitionRequestedEvent): Promise<void> {
    if (event.payload.type !== 'revisions') {
      return
    }

    const userUuid = await this.getUserUuidFromEvent(event)
    if (!userUuid) {
      return
    }

    if (await this.isAlreadyMigrated(userUuid)) {
      this.logger.info(`User ${event.payload.userUuid} already migrated.`)

      await this.domainEventPublisher.publish(
        this.domainEventFactory.createTransitionStatusUpdatedEvent({
          userUuid: event.payload.userUuid,
          status: TransitionStatus.STATUSES.Verified,
          transitionType: 'revisions',
          transitionTimestamp: event.payload.timestamp,
        }),
      )

      return
    }

    this.logger.info(`Handling transition requested event for user ${event.payload.userUuid}`)

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createTransitionStatusUpdatedEvent({
        userUuid: event.payload.userUuid,
        status: TransitionStatus.STATUSES.InProgress,
        transitionType: 'revisions',
        transitionTimestamp: event.payload.timestamp,
      }),
    )

    const result = await this.transitionRevisionsFromPrimaryToSecondaryDatabaseForUser.execute({
      userUuid: event.payload.userUuid,
    })

    if (result.isFailed()) {
      this.logger.error(`Failed to transition for user ${event.payload.userUuid}`)

      await this.domainEventPublisher.publish(
        this.domainEventFactory.createTransitionStatusUpdatedEvent({
          userUuid: event.payload.userUuid,
          status: TransitionStatus.STATUSES.Failed,
          transitionType: 'revisions',
          transitionTimestamp: event.payload.timestamp,
        }),
      )

      return
    }

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createTransitionStatusUpdatedEvent({
        userUuid: event.payload.userUuid,
        status: TransitionStatus.STATUSES.Verified,
        transitionType: 'revisions',
        transitionTimestamp: event.payload.timestamp,
      }),
    )
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

  private async getUserUuidFromEvent(event: TransitionRequestedEvent): Promise<Uuid | null> {
    const userUuidOrError = Uuid.create(event.payload.userUuid)
    if (userUuidOrError.isFailed()) {
      this.logger.error(
        `Failed to transition revisions for user ${event.payload.userUuid}: ${userUuidOrError.getError()}`,
      )
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createTransitionStatusUpdatedEvent({
          userUuid: event.payload.userUuid,
          status: TransitionStatus.STATUSES.Failed,
          transitionType: 'revisions',
          transitionTimestamp: event.payload.timestamp,
        }),
      )

      return null
    }

    return userUuidOrError.getValue()
  }
}

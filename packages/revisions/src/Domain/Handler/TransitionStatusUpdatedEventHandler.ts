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
          transitionTimestamp: event.payload.transitionTimestamp,
        }),
      )

      return
    }

    this.logger.info(
      `Received transition status updated event to ${event.payload.status} for user ${event.payload.userUuid}`,
    )

    if (event.payload.status === 'STARTED' && event.payload.transitionType === 'revisions') {
      const userUuid = await this.getUserUuidFromEvent(event)
      if (userUuid === null) {
        return
      }

      if (await this.isAlreadyMigrated(userUuid)) {
        await this.domainEventPublisher.publish(
          this.domainEventFactory.createTransitionStatusUpdatedEvent({
            userUuid: event.payload.userUuid,
            status: 'FINISHED',
            transitionType: 'revisions',
            transitionTimestamp: event.payload.transitionTimestamp,
          }),
        )

        return
      }

      await this.domainEventPublisher.publish(
        this.domainEventFactory.createTransitionStatusUpdatedEvent({
          userUuid: event.payload.userUuid,
          status: 'IN_PROGRESS',
          transitionType: 'revisions',
          transitionTimestamp: event.payload.transitionTimestamp,
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
            transitionTimestamp: event.payload.transitionTimestamp,
          }),
        )

        return
      }

      await this.domainEventPublisher.publish(
        this.domainEventFactory.createTransitionStatusUpdatedEvent({
          userUuid: event.payload.userUuid,
          status: 'FINISHED',
          transitionType: 'revisions',
          transitionTimestamp: event.payload.transitionTimestamp,
        }),
      )

      return
    }

    if (event.payload.status === 'FINISHED' && event.payload.transitionType === 'revisions') {
      const userUuid = await this.getUserUuidFromEvent(event)
      if (userUuid === null) {
        return
      }

      if (await this.isAlreadyMigrated(userUuid)) {
        this.domainEventFactory.createTransitionStatusUpdatedEvent({
          userUuid: event.payload.userUuid,
          status: 'VERIFIED',
          transitionType: 'revisions',
          transitionTimestamp: event.payload.transitionTimestamp,
        })
      }
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

  private async getUserUuidFromEvent(event: TransitionStatusUpdatedEvent): Promise<Uuid | null> {
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
          transitionTimestamp: event.payload.transitionTimestamp,
        }),
      )

      return null
    }

    return userUuidOrError.getValue()
  }
}

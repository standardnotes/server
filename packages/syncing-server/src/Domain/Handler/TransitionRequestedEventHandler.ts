import {
  DomainEventHandlerInterface,
  DomainEventPublisherInterface,
  TransitionRequestedEvent,
} from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { TransitionStatus, Uuid } from '@standardnotes/domain-core'

import { TransitionItemsFromPrimaryToSecondaryDatabaseForUser } from '../UseCase/Transition/TransitionItemsFromPrimaryToSecondaryDatabaseForUser/TransitionItemsFromPrimaryToSecondaryDatabaseForUser'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'

export class TransitionRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private primaryItemRepository: ItemRepositoryInterface,
    private transitionItemsFromPrimaryToSecondaryDatabaseForUser: TransitionItemsFromPrimaryToSecondaryDatabaseForUser,
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private logger: Logger,
  ) {}

  async handle(event: TransitionRequestedEvent): Promise<void> {
    if (event.payload.type !== 'items') {
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
          transitionType: 'items',
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
        transitionType: 'items',
        transitionTimestamp: event.payload.timestamp,
      }),
    )

    const result = await this.transitionItemsFromPrimaryToSecondaryDatabaseForUser.execute({
      userUuid: event.payload.userUuid,
    })

    if (result.isFailed()) {
      this.logger.error(`Failed to trigger transition for user ${event.payload.userUuid}`)

      await this.domainEventPublisher.publish(
        this.domainEventFactory.createTransitionStatusUpdatedEvent({
          userUuid: event.payload.userUuid,
          status: TransitionStatus.STATUSES.Failed,
          transitionType: 'items',
          transitionTimestamp: event.payload.timestamp,
        }),
      )

      return
    }

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createTransitionStatusUpdatedEvent({
        userUuid: event.payload.userUuid,
        status: TransitionStatus.STATUSES.Verified,
        transitionType: 'items',
        transitionTimestamp: event.payload.timestamp,
      }),
    )
  }

  private async isAlreadyMigrated(userUuid: Uuid): Promise<boolean> {
    const totalItemsCountForUserInPrimary = await this.primaryItemRepository.countAll({
      userUuid: userUuid.value,
    })

    if (totalItemsCountForUserInPrimary > 0) {
      this.logger.info(`User ${userUuid.value} has ${totalItemsCountForUserInPrimary} items in primary database.`)
    }

    return totalItemsCountForUserInPrimary === 0
  }

  private async getUserUuidFromEvent(event: TransitionRequestedEvent): Promise<Uuid | null> {
    const userUuidOrError = Uuid.create(event.payload.userUuid)
    if (userUuidOrError.isFailed()) {
      this.logger.error(`Failed to transition items for user ${event.payload.userUuid}: ${userUuidOrError.getError()}`)

      await this.domainEventPublisher.publish(
        this.domainEventFactory.createTransitionStatusUpdatedEvent({
          userUuid: event.payload.userUuid,
          status: TransitionStatus.STATUSES.Failed,
          transitionType: 'items',
          transitionTimestamp: event.payload.timestamp,
        }),
      )

      return null
    }

    return userUuidOrError.getValue()
  }
}

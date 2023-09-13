import {
  DomainEventHandlerInterface,
  DomainEventPublisherInterface,
  TransitionStatusUpdatedEvent,
} from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { TransitionItemsFromPrimaryToSecondaryDatabaseForUser } from '../UseCase/Transition/TransitionItemsFromPrimaryToSecondaryDatabaseForUser/TransitionItemsFromPrimaryToSecondaryDatabaseForUser'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'

export class TransitionStatusUpdatedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private primaryItemRepository: ItemRepositoryInterface,
    private transitionItemsFromPrimaryToSecondaryDatabaseForUser: TransitionItemsFromPrimaryToSecondaryDatabaseForUser,
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private logger: Logger,
  ) {}

  async handle(event: TransitionStatusUpdatedEvent): Promise<void> {
    if (event.payload.status === 'STARTED' && event.payload.transitionType === 'items') {
      if (await this.isAlreadyMigrated(event.payload.userUuid)) {
        this.logger.info(`Items for user ${event.payload.userUuid} are already migrated`)

        await this.domainEventPublisher.publish(
          this.domainEventFactory.createTransitionStatusUpdatedEvent({
            userUuid: event.payload.userUuid,
            status: 'FINISHED',
            transitionType: 'items',
          }),
        )

        return
      }

      await this.domainEventPublisher.publish(
        this.domainEventFactory.createTransitionStatusUpdatedEvent({
          userUuid: event.payload.userUuid,
          status: 'IN_PROGRESS',
          transitionType: 'items',
        }),
      )

      const result = await this.transitionItemsFromPrimaryToSecondaryDatabaseForUser.execute({
        userUuid: event.payload.userUuid,
      })

      if (result.isFailed()) {
        this.logger.error(`Failed to transition items for user ${event.payload.userUuid}: ${result.getError()}`)

        await this.domainEventPublisher.publish(
          this.domainEventFactory.createTransitionStatusUpdatedEvent({
            userUuid: event.payload.userUuid,
            status: 'FAILED',
            transitionType: 'items',
          }),
        )

        return
      }

      await this.domainEventPublisher.publish(
        this.domainEventFactory.createTransitionStatusUpdatedEvent({
          userUuid: event.payload.userUuid,
          status: 'FINISHED',
          transitionType: 'items',
        }),
      )
    }
  }

  private async isAlreadyMigrated(userUuid: string): Promise<boolean> {
    const totalItemsCountForUser = await this.primaryItemRepository.countAll({ userUuid })

    if (totalItemsCountForUser > 0) {
      this.logger.info(`User ${userUuid} has ${totalItemsCountForUser} items in primary database.`)
    }

    return totalItemsCountForUser === 0
  }
}

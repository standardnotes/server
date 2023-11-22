import {
  AccountDeletionVerificationRequestedEvent,
  DomainEventHandlerInterface,
  DomainEventPublisherInterface,
} from '@standardnotes/domain-events'
import { Uuid } from '@standardnotes/domain-core'
import { Logger } from 'winston'

import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'

export class AccountDeletionVerificationRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private itemRepository: ItemRepositoryInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private logger: Logger,
  ) {}

  async handle(event: AccountDeletionVerificationRequestedEvent): Promise<void> {
    const userUuidOrError = Uuid.create(event.payload.userUuid)
    if (userUuidOrError.isFailed()) {
      this.logger.error(`AccountDeletionVerificationRequestedEventHandler failed: ${userUuidOrError.getError()}`)

      return
    }
    const userUuid = userUuidOrError.getValue()

    const itemsCount = await this.itemRepository.countAll({
      userUuid: userUuid.value,
    })

    if (itemsCount !== 0) {
      this.logger.warn(
        `AccountDeletionVerificationRequestedEventHandler: User ${userUuid.value} has ${itemsCount} items and cannot be deleted.`,
      )

      return
    }

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createAccountDeletionVerificationPassedEvent({
        userUuid: userUuid.value,
        email: event.payload.email,
      }),
    )
  }
}

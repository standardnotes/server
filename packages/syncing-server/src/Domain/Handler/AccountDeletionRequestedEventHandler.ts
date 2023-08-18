import { AccountDeletionRequestedEvent, DomainEventHandlerInterface } from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'

export class AccountDeletionRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private primaryItemRepository: ItemRepositoryInterface,
    private secondaryItemRepository: ItemRepositoryInterface | null,
    private logger: Logger,
  ) {}

  async handle(event: AccountDeletionRequestedEvent): Promise<void> {
    await this.primaryItemRepository.deleteByUserUuid(event.payload.userUuid)
    if (this.secondaryItemRepository) {
      await this.secondaryItemRepository.deleteByUserUuid(event.payload.userUuid)
    }

    this.logger.info(`Finished account cleanup for user: ${event.payload.userUuid}`)
  }
}

import { AccountDeletionRequestedEvent, DomainEventHandlerInterface } from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'

export class AccountDeletionRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(private itemRepository: ItemRepositoryInterface, private logger: Logger) {}

  async handle(event: AccountDeletionRequestedEvent): Promise<void> {
    await this.itemRepository.deleteByUserUuid(event.payload.userUuid)

    this.logger.info(`Finished account cleanup for user: ${event.payload.userUuid}`)
  }
}

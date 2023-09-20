import { DomainEventHandlerInterface, SharedVaultRemovedEvent } from '@standardnotes/domain-events'
import { RemoveItemsFromSharedVault } from '../UseCase/SharedVaults/RemoveItemsFromSharedVault/RemoveItemsFromSharedVault'
import { Logger } from 'winston'

export class SharedVaultRemovedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private removeItemsFromSharedVault: RemoveItemsFromSharedVault,
    private logger: Logger,
  ) {}

  async handle(event: SharedVaultRemovedEvent): Promise<void> {
    const result = await this.removeItemsFromSharedVault.execute({
      sharedVaultUuid: event.payload.sharedVaultUuid,
    })

    if (result.isFailed()) {
      this.logger.error(
        `Failed to remove items from shared vault ${event.payload.sharedVaultUuid}: ${result.getError()}`,
      )
    }
  }
}

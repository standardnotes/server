import { DomainEventHandlerInterface, ItemRemovedFromSharedVaultEvent } from '@standardnotes/domain-events'
import { RemoveRevisionsFromSharedVault } from '../UseCase/RemoveRevisionsFromSharedVault/RemoveRevisionsFromSharedVault'
import { Logger } from 'winston'

export class ItemRemovedFromSharedVaultEventHandler implements DomainEventHandlerInterface {
  constructor(
    private removeRevisionsFromSharedVault: RemoveRevisionsFromSharedVault,
    private logger: Logger,
  ) {}

  async handle(event: ItemRemovedFromSharedVaultEvent): Promise<void> {
    const result = await this.removeRevisionsFromSharedVault.execute({
      sharedVaultUuid: event.payload.sharedVaultUuid,
      itemUuid: event.payload.itemUuid,
      roleNames: event.payload.roleNames,
    })

    if (result.isFailed()) {
      this.logger.error(`Failed to remove revisions from shared vault: ${result.getError()}`)
    }
  }
}

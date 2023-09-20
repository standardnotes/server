import { DomainEventHandlerInterface, SharedVaultRemovedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { RemoveRevisionsFromSharedVault } from '../UseCase/RemoveRevisionsFromSharedVault/RemoveRevisionsFromSharedVault'

export class SharedVaultRemovedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private removeRevisionsFromSharedVault: RemoveRevisionsFromSharedVault,
    private logger: Logger,
  ) {}

  async handle(event: SharedVaultRemovedEvent): Promise<void> {
    const result = await this.removeRevisionsFromSharedVault.execute({
      sharedVaultUuid: event.payload.sharedVaultUuid,
    })

    if (result.isFailed()) {
      this.logger.error(`Failed to remove revisions from shared vault: ${result.getError()}`)
    }
  }
}

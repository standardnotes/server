import { DomainEventHandlerInterface, UserRemovedFromSharedVaultEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { RemoveSharedVaultUser } from '../UseCase/RemoveSharedVaultUser/RemoveSharedVaultUser'

export class UserRemovedFromSharedVaultEventHandler implements DomainEventHandlerInterface {
  constructor(
    private removeSharedVaultUser: RemoveSharedVaultUser,
    private logger: Logger,
  ) {}

  async handle(event: UserRemovedFromSharedVaultEvent): Promise<void> {
    const result = await this.removeSharedVaultUser.execute({
      userUuid: event.payload.userUuid,
      sharedVaultUuid: event.payload.sharedVaultUuid,
    })

    if (result.isFailed()) {
      this.logger.error(`Failed to remove user from shared vault: ${result.getError()}`)
    }
  }
}

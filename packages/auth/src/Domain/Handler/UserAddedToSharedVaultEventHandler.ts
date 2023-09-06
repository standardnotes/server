import { DomainEventHandlerInterface, UserAddedToSharedVaultEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'
import { AddSharedVaultUser } from '../UseCase/AddSharedVaultUser/AddSharedVaultUser'

export class UserAddedToSharedVaultEventHandler implements DomainEventHandlerInterface {
  constructor(
    private addSharedVaultUser: AddSharedVaultUser,
    private logger: Logger,
  ) {}

  async handle(event: UserAddedToSharedVaultEvent): Promise<void> {
    const result = await this.addSharedVaultUser.execute({
      userUuid: event.payload.userUuid,
      sharedVaultUuid: event.payload.sharedVaultUuid,
      permission: event.payload.permission,
      createdAt: event.payload.createdAt,
      updatedAt: event.payload.updatedAt,
    })

    if (result.isFailed()) {
      this.logger.error(`Failed to add user to shared vault: ${result.getError()}`)
    }
  }
}

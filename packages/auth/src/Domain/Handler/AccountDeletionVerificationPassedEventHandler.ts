import { AccountDeletionVerificationPassedEvent, DomainEventHandlerInterface } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { DeleteAccount } from '../UseCase/DeleteAccount/DeleteAccount'

export class AccountDeletionVerificationPassedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private deleteAccount: DeleteAccount,
    private logger: Logger,
  ) {}

  async handle(event: AccountDeletionVerificationPassedEvent): Promise<void> {
    const result = await this.deleteAccount.execute({
      userUuid: event.payload.userUuid,
    })

    if (result.isFailed()) {
      this.logger.error(`AccountDeletionVerificationPassedEventHandler failed: ${result.getError()}`)
    }
  }
}

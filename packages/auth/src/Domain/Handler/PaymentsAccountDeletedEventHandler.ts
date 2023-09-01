import { DomainEventHandlerInterface, PaymentsAccountDeletedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { DeleteAccount } from '../UseCase/DeleteAccount/DeleteAccount'

export class PaymentsAccountDeletedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private deleteAccountUseCase: DeleteAccount,
    private logger: Logger,
  ) {}

  async handle(event: PaymentsAccountDeletedEvent): Promise<void> {
    const result = await this.deleteAccountUseCase.execute({
      username: event.payload.username,
    })

    if (result.isFailed()) {
      this.logger.error(`Failed to delete account for user ${event.payload.username}: ${result.getError()}`)
    }
  }
}

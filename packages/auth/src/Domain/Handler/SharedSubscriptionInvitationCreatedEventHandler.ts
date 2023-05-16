import { DomainEventHandlerInterface, SharedSubscriptionInvitationCreatedEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { InviteeIdentifierType } from '../SharedSubscription/InviteeIdentifierType'
import { AcceptSharedSubscriptionInvitation } from '../UseCase/AcceptSharedSubscriptionInvitation/AcceptSharedSubscriptionInvitation'

@injectable()
export class SharedSubscriptionInvitationCreatedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.Auth_AcceptSharedSubscriptionInvitation)
    private acceptSharedSubscriptionInvitation: AcceptSharedSubscriptionInvitation,
  ) {}

  async handle(event: SharedSubscriptionInvitationCreatedEvent): Promise<void> {
    if (event.payload.inviteeIdentifierType != InviteeIdentifierType.Hash) {
      return
    }

    await this.acceptSharedSubscriptionInvitation.execute({
      sharedSubscriptionInvitationUuid: event.payload.sharedSubscriptionInvitationUuid,
    })
  }
}

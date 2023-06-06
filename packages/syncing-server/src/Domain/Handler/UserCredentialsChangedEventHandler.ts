import {
  DomainEventHandlerInterface,
  UserCredentialsChangedEvent,
  UserCredentialsChangedEventPayload,
} from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { ContactsRepositoryInterface } from '../Contact/Repository/ContactRepositoryInterface'
import { SharedVaultInviteRepositoryInterface } from '../SharedVaultInvite/Repository/SharedVaultInviteRepositoryInterface'

export class UserCredentialsChangedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private contactRepository: ContactsRepositoryInterface,
    private sharedVaultInviteRepository: SharedVaultInviteRepositoryInterface,
    private timer: TimerInterface,
  ) {}

  async handle(event: UserCredentialsChangedEvent): Promise<void> {
    await this.updatePublicKeyOfAllContacts(event.payload)

    await this.nullifyPendingInboundSharedVaultInvites(event.payload)
  }

  private async updatePublicKeyOfAllContacts(payload: UserCredentialsChangedEventPayload): Promise<void> {
    const contacts = await this.contactRepository.findAll({ contactUuid: payload.userUuid })
    for (const contact of contacts) {
      if (contact.contactPublicKey === payload.newPublicKey) {
        continue
      }

      contact.contactPublicKey = payload.newPublicKey
      contact.contactSigningPublicKey = payload.newSigningPublicKey

      contact.updatedAtTimestamp = this.timer.getTimestampInMicroseconds()

      await this.contactRepository.save(contact)
    }
  }

  private async nullifyPendingInboundSharedVaultInvites(payload: UserCredentialsChangedEventPayload): Promise<void> {
    const inboundInvites = await this.sharedVaultInviteRepository.findAll({
      userUuid: payload.userUuid,
    })

    for (const invite of inboundInvites) {
      await this.sharedVaultInviteRepository.remove(invite)
    }
  }
}

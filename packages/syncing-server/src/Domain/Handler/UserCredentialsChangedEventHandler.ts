import {
  DomainEventHandlerInterface,
  UserCredentialsChangedEvent,
  UserCredentialsChangedEventPayload,
} from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { ContactsRepositoryInterface } from '../Contact/Repository/ContactRepositoryInterface'
import { VaultInviteRepositoryInterface } from '../VaultInvite/Repository/VaultInviteRepositoryInterface'

export class UserCredentialsChangedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private contactRepository: ContactsRepositoryInterface,
    private vaultInviteRepository: VaultInviteRepositoryInterface,
    private timer: TimerInterface,
  ) {}

  async handle(event: UserCredentialsChangedEvent): Promise<void> {
    await this.updatePublicKeyOfAllContacts(event.payload)
    await this.nullifyPendingInboundVaultInvites(event.payload)
  }

  private async updatePublicKeyOfAllContacts(payload: UserCredentialsChangedEventPayload): Promise<void> {
    const contacts = await this.contactRepository.findAll({ contactUuid: payload.userUuid })
    for (const contact of contacts) {
      if (contact.contactPublicKey === payload.newPublicKey) {
        continue
      }
      contact.contactPublicKey = payload.newPublicKey
      contact.updatedAtTimestamp = this.timer.getTimestampInMicroseconds()
      await this.contactRepository.save(contact)
    }
  }

  private async nullifyPendingInboundVaultInvites(payload: UserCredentialsChangedEventPayload): Promise<void> {
    const inboundInvites = await this.vaultInviteRepository.findAll({
      userUuid: payload.userUuid,
    })

    for (const invite of inboundInvites) {
      await this.vaultInviteRepository.remove(invite)
    }
  }
}

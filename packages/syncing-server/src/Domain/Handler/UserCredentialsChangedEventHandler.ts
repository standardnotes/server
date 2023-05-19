import { DomainEventHandlerInterface, UserCredentialsChangedEvent } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { ContactsRepositoryInterface } from '../Contact/Repository/ContactRepositoryInterface'

export class UserCredentialsChangedEventHandler implements DomainEventHandlerInterface {
  constructor(private contactRepository: ContactsRepositoryInterface, private timer: TimerInterface) {}

  async handle(event: UserCredentialsChangedEvent): Promise<void> {
    const contacts = await this.contactRepository.findAll({ contactUuid: event.payload.userUuid })

    for (const contact of contacts) {
      contact.contactPublicKey = event.payload.newPublicKey
      contact.updatedAtTimestamp = this.timer.getTimestampInMicroseconds()
      await this.contactRepository.save(contact)
    }
  }
}

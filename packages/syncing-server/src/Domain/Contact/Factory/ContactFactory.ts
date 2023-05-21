import { TimerInterface } from '@standardnotes/time'
import { ContactFactoryInterface } from './ContactFactoryInterface'
import { ContactHash } from './ContactHash'
import { Contact } from '../Model/Contact'

export class ContactFactory implements ContactFactoryInterface {
  constructor(private timer: TimerInterface) {}

  create(dto: { userUuid: string; contactHash: ContactHash }): Contact {
    const newContact = new Contact()
    newContact.uuid = dto.contactHash.uuid
    newContact.userUuid = dto.userUuid
    newContact.contactUuid = dto.contactHash.contact_uuid
    newContact.contactPublicKey = dto.contactHash.contact_public_key

    const now = this.timer.getTimestampInMicroseconds()
    newContact.updatedAtTimestamp = now
    newContact.createdAtTimestamp = now

    if (dto.contactHash.created_at_timestamp) {
      newContact.createdAtTimestamp = dto.contactHash.created_at_timestamp
    }

    return newContact
  }

  createStub(dto: { userUuid: string; contactHash: ContactHash }): Contact {
    const item = this.create(dto)
    return item
  }
}

import { v4 as uuidv4 } from 'uuid'
import { TimerInterface } from '@standardnotes/time'

import { Contact } from '../Model/Contact'
import { ContactsRepositoryInterface } from '../Repository/ContactRepositoryInterface'
import { ContactServiceInterface } from './ContactServiceInterface'
import { ContactFactoryInterface } from '../Factory/ContactFactoryInterface'

export class ContactService implements ContactServiceInterface {
  constructor(
    private contactRepository: ContactsRepositoryInterface,
    private contactFactory: ContactFactoryInterface,
    private timer: TimerInterface,
  ) {}

  async createContact(dto: {
    userUuid: string
    contactUuid: string
    contactPublicKey: string
  }): Promise<Contact | null> {
    const contact = this.contactFactory.create({
      userUuid: dto.userUuid,
      contactHash: {
        uuid: uuidv4(),
        user_uuid: dto.userUuid,
        contact_uuid: dto.contactUuid,
        contact_public_key: dto.contactPublicKey,
        created_at_timestamp: this.timer.getTimestampInMicroseconds(),
        updated_at_timestamp: this.timer.getTimestampInMicroseconds(),
      },
    })

    const savedContact = await this.contactRepository.create(contact)

    return savedContact
  }

  async deleteContact(dto: { contactUuid: string; originatorUuid: string }): Promise<boolean> {
    const contact = await this.contactRepository.findByUuid(dto.contactUuid)
    if (!contact || contact.userUuid !== dto.originatorUuid) {
      return false
    }

    await this.contactRepository.remove(contact)

    return true
  }

  async getUserContacts(dto: { userUuid: string; lastSyncTime?: number }): Promise<Contact[]> {
    return this.contactRepository.findAll({ userUuid: dto.userUuid, lastSyncTime: dto.lastSyncTime })
  }
}

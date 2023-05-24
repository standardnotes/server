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
    const timestamp = this.timer.getTimestampInMicroseconds()
    const contact = this.contactFactory.create({
      userUuid: dto.userUuid,
      contactHash: {
        uuid: uuidv4(),
        user_uuid: dto.userUuid,
        contact_uuid: dto.contactUuid,
        contact_public_key: dto.contactPublicKey,
        created_at_timestamp: timestamp,
        updated_at_timestamp: timestamp,
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

  async refreshAllContactsAfterPublicKeyChange(dto: { userUuid: string; publicKey: string }): Promise<void> {
    const contacts = await this.contactRepository.findAll({ contactUuid: dto.userUuid })

    for (const contact of contacts) {
      if (contact.contactPublicKey === dto.publicKey) {
        continue
      }

      contact.contactPublicKey = dto.publicKey
      contact.updatedAtTimestamp = this.timer.getTimestampInMicroseconds()
      await this.contactRepository.save(contact)
    }
  }

  async getUserContacts(dto: { userUuid: string; lastSyncTime?: number }): Promise<Contact[]> {
    return this.contactRepository.findAll({ userUuid: dto.userUuid, lastSyncTime: dto.lastSyncTime })
  }
}

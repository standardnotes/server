import { Contact } from '../Model/Contact'

export type ContactQuery = {
  userUuid?: string
  contactUuid?: string
  lastSyncTime?: number
}

export interface ContactsRepositoryInterface {
  findByUuid(uuid: string): Promise<Contact | null>
  create(contact: Contact): Promise<Contact>
  save(contact: Contact): Promise<Contact>
  remove(contact: Contact): Promise<Contact>
  findAll(query: ContactQuery): Promise<Contact[]>
}

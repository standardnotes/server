import { Contact } from '../Model/Contact'

export interface ContactServiceInterface {
  createContact(dto: {
    userUuid: string
    contactUuid: string
    contactPublicKey: string
    contactSigningPublicKey: string
  }): Promise<Contact | null>

  deleteContact(dto: { contactUuid: string; originatorUuid: string }): Promise<boolean>

  getUserContacts(dto: { userUuid: string; lastSyncTime?: number }): Promise<Contact[]>

  refreshAllContactsAfterPublicKeyChange(dto: { userUuid: string; publicKey: string }): Promise<void>
}

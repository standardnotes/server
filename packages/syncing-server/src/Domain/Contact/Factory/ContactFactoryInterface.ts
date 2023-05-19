import { Contact } from '../Model/Contact'
import { ContactHash } from './ContactHash'

export interface ContactFactoryInterface {
  create(dto: { userUuid: string; contactHash: ContactHash }): Contact
  createStub(dto: { userUuid: string; contactHash: ContactHash }): Contact
}

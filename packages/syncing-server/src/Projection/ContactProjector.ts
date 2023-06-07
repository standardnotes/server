import { Contact } from '../Domain/Contact/Model/Contact'
import { ProjectorInterface } from './ProjectorInterface'
import { ContactProjection } from './ContactProjection'

export class ContactProjector implements ProjectorInterface<Contact, ContactProjection> {
  projectSimple(_contact: Contact): ContactProjection {
    throw Error('not implemented')
  }

  projectCustom(_projectionType: string, contact: Contact): ContactProjection {
    const fullProjection = this.projectFull(contact)

    return {
      ...fullProjection,
      user_uuid: contact.userUuid,
    }
  }

  projectFull(contact: Contact): ContactProjection {
    return {
      uuid: contact.uuid,
      user_uuid: contact.userUuid,
      contact_uuid: contact.contactUuid,
      contact_public_key: contact.contactPublicKey,
      contact_signing_public_key: contact.contactSigningPublicKey,
      created_at_timestamp: contact.createdAtTimestamp,
      updated_at_timestamp: contact.updatedAtTimestamp,
    }
  }
}

import { Contact } from '../Domain/Contact/Model/Contact'
import { ProjectorInterface } from './ProjectorInterface'
import { ContactProjection } from './ContactProjection'

export class ContactProjector implements ProjectorInterface<Contact, ContactProjection> {
  projectSimple(_userKey: Contact): ContactProjection {
    throw Error('not implemented')
  }

  projectCustom(_projectionType: string, userKey: Contact): ContactProjection {
    const fullProjection = this.projectFull(userKey)

    return {
      ...fullProjection,
      user_uuid: userKey.userUuid,
    }
  }

  projectFull(userKey: Contact): ContactProjection {
    return {
      uuid: userKey.uuid,
      user_uuid: userKey.userUuid,
      contact_uuid: userKey.contactUuid,
      contact_public_key: userKey.contactPublicKey,
      created_at_timestamp: userKey.createdAtTimestamp,
      updated_at_timestamp: userKey.updatedAtTimestamp,
    }
  }
}

import { AsymmetricMessage } from '../Domain/AsymmetricMessage/Model/AsymmetricMessage'
import { ProjectorInterface } from './ProjectorInterface'
import { AsymmetricMessageProjection } from './AsymmetricMessageProjection'

export class AsymmetricMessageProjector implements ProjectorInterface<AsymmetricMessage, AsymmetricMessageProjection> {
  projectSimple(_asymmetricMessage: AsymmetricMessage): AsymmetricMessageProjection {
    throw Error('not implemented')
  }

  projectCustom(_projectionType: string, asymmetricMessage: AsymmetricMessage): AsymmetricMessageProjection {
    const fullProjection = this.projectFull(asymmetricMessage)

    return {
      ...fullProjection,
      user_uuid: asymmetricMessage.userUuid,
    }
  }

  projectFull(asymmetricMessage: AsymmetricMessage): AsymmetricMessageProjection {
    return {
      uuid: asymmetricMessage.uuid,
      user_uuid: asymmetricMessage.userUuid,
      sender_uuid: asymmetricMessage.senderUuid,
      sender_public_key: asymmetricMessage.senderPublicKey,
      encrypted_message: asymmetricMessage.encryptedMessage,
      created_at_timestamp: asymmetricMessage.createdAtTimestamp,
      updated_at_timestamp: asymmetricMessage.updatedAtTimestamp,
    }
  }
}

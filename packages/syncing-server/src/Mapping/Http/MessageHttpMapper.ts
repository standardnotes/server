import { MapperInterface } from '@standardnotes/domain-core'

import { Message } from '../../Domain/Message/Message'
import { MessageHttpRepresentation } from './MessageHttpRepresentation'

export class MessageHttpMapper implements MapperInterface<Message, MessageHttpRepresentation> {
  toDomain(_projection: MessageHttpRepresentation): Message {
    throw new Error('Mapping from http representation to domain is not implemented.')
  }

  toProjection(domain: Message): MessageHttpRepresentation {
    return {
      uuid: domain.id.toString(),
      recipient_uuid: domain.props.recipientUuid.value,
      sender_uuid: domain.props.senderUuid.value,
      encrypted_message: domain.props.encryptedMessage,
      created_at_timestamp: domain.props.timestamps.createdAt,
      updated_at_timestamp: domain.props.timestamps.updatedAt,
    }
  }
}

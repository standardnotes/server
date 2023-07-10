import { Timestamps, MapperInterface, UniqueEntityId, Uuid, Validator } from '@standardnotes/domain-core'

import { Message } from '../../Domain/Message/Message'

import { TypeORMMessage } from '../../Infra/TypeORM/TypeORMMessage'

export class MessagePersistenceMapper implements MapperInterface<Message, TypeORMMessage> {
  toDomain(projection: TypeORMMessage): Message {
    const recipientUuidOrError = Uuid.create(projection.recipientUuid)
    if (recipientUuidOrError.isFailed()) {
      throw new Error(`Failed to create message from projection: ${recipientUuidOrError.getError()}`)
    }
    const recipientUuid = recipientUuidOrError.getValue()

    const senderUuidOrError = Uuid.create(projection.senderUuid)
    if (senderUuidOrError.isFailed()) {
      throw new Error(`Failed to create message from projection: ${senderUuidOrError.getError()}`)
    }
    const senderUuid = senderUuidOrError.getValue()

    const timestampsOrError = Timestamps.create(projection.createdAtTimestamp, projection.updatedAtTimestamp)
    if (timestampsOrError.isFailed()) {
      throw new Error(`Failed to create notification from projection: ${timestampsOrError.getError()}`)
    }
    const timestamps = timestampsOrError.getValue()

    const validateNotEmptyMessage = Validator.isNotEmpty(projection.encryptedMessage)
    if (validateNotEmptyMessage.isFailed()) {
      throw new Error(`Failed to create message from projection: ${validateNotEmptyMessage.getError()}`)
    }

    const messageOrError = Message.create(
      {
        recipientUuid,
        senderUuid,
        encryptedMessage: projection.encryptedMessage,
        replaceabilityIdentifier: projection.replaceabilityIdentifier,
        timestamps,
      },
      new UniqueEntityId(projection.uuid),
    )
    if (messageOrError.isFailed()) {
      throw new Error(`Failed to create message from projection: ${messageOrError.getError()}`)
    }
    const message = messageOrError.getValue()

    return message
  }

  toProjection(domain: Message): TypeORMMessage {
    const typeorm = new TypeORMMessage()

    typeorm.uuid = domain.id.toString()
    typeorm.encryptedMessage = domain.props.encryptedMessage
    typeorm.recipientUuid = domain.props.recipientUuid.value
    typeorm.senderUuid = domain.props.senderUuid.value
    typeorm.replaceabilityIdentifier = domain.props.replaceabilityIdentifier
    typeorm.createdAtTimestamp = domain.props.timestamps.createdAt
    typeorm.updatedAtTimestamp = domain.props.timestamps.updatedAt

    return typeorm
  }
}

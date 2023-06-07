import { TimerInterface } from '@standardnotes/time'
import { AsymmetricMessageFactoryInterface } from './AsymmetricMessageFactoryInterface'
import { AsymmetricMessageHash } from './AsymmetricMessageHash'
import { AsymmetricMessage } from '../Model/AsymmetricMessage'

export class AsymmetricMessageFactory implements AsymmetricMessageFactoryInterface {
  constructor(private timer: TimerInterface) {}

  create(dto: AsymmetricMessageHash): AsymmetricMessage {
    const newAsymmetricMessage = new AsymmetricMessage()
    newAsymmetricMessage.uuid = dto.uuid
    newAsymmetricMessage.userUuid = dto.user_uuid
    newAsymmetricMessage.senderUuid = dto.sender_uuid
    newAsymmetricMessage.senderPublicKey = dto.sender_public_key
    newAsymmetricMessage.encryptedMessage = dto.encrypted_message

    const now = this.timer.getTimestampInMicroseconds()
    newAsymmetricMessage.updatedAtTimestamp = now
    newAsymmetricMessage.createdAtTimestamp = now

    if (dto.created_at_timestamp) {
      newAsymmetricMessage.createdAtTimestamp = dto.created_at_timestamp
    }

    return newAsymmetricMessage
  }

  createStub(dto: AsymmetricMessageHash): AsymmetricMessage {
    const item = this.create(dto)
    return item
  }
}

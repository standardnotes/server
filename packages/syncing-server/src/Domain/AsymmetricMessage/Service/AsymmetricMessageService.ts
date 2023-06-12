import { TimerInterface } from '@standardnotes/time'
import { AsymmetricMessage } from '../Model/AsymmetricMessage'
import { AsymmetricMessageFactoryInterface } from '../Factory/AsymmetricMessageFactoryInterface'
import { v4 as uuidv4 } from 'uuid'
import { AsymmetricMessageRepositoryInterface } from '../Repository/AsymmetricMessageRepositoryInterface'
import { AsymmetricMessageServiceInterface } from './AsymmetricMessageServiceInterface'
import { GetUserAsymmetricMessagesDTO } from './GetUserAsymmetricMessagesDTO'
import { CreateAsymmetricMessageDTO } from './CreateAsymmetricMessageDTO'

export class AsymmetricMessageService implements AsymmetricMessageServiceInterface {
  constructor(
    private asymmetricMessageRepository: AsymmetricMessageRepositoryInterface,
    private asymmetricMessageFactory: AsymmetricMessageFactoryInterface,
    private timer: TimerInterface,
  ) {}

  async createMessage(dto: CreateAsymmetricMessageDTO): Promise<AsymmetricMessage | null> {
    const timestamp = this.timer.getTimestampInMicroseconds()

    if (dto.replaceabilityIdentifier) {
      const existingMessage = await this.asymmetricMessageRepository.findByUserAndReplaceabilityIdentifier(
        dto.userUuid,
        dto.replaceabilityIdentifier,
      )

      if (existingMessage) {
        await this.asymmetricMessageRepository.remove(existingMessage)
      }
    }

    const asymmetricMessage = this.asymmetricMessageFactory.create({
      uuid: uuidv4(),
      user_uuid: dto.userUuid,
      sender_uuid: dto.senderUuid,
      encrypted_message: dto.encryptedMessage,
      replaceability_identifier: dto.replaceabilityIdentifier,
      created_at_timestamp: timestamp,
      updated_at_timestamp: timestamp,
    })

    return this.asymmetricMessageRepository.create(asymmetricMessage)
  }

  getMessagesForUser(dto: GetUserAsymmetricMessagesDTO): Promise<AsymmetricMessage[]> {
    return this.asymmetricMessageRepository.findAll(dto)
  }

  getOutboundMessagesForUser(dto: { userUuid: string }): Promise<AsymmetricMessage[]> {
    return this.asymmetricMessageRepository.findAll({
      senderUuid: dto.userUuid,
    })
  }

  async deleteAllInboundMessages(dto: { userUuid: string }): Promise<void> {
    const inboundMessages = await this.asymmetricMessageRepository.findAll({
      userUuid: dto.userUuid,
    })

    for (const message of inboundMessages) {
      await this.asymmetricMessageRepository.remove(message)
    }
  }

  async deleteMessage(dto: { originatorUuid: string; messageUuid: string }): Promise<boolean> {
    const message = await this.asymmetricMessageRepository.findByUuid(dto.messageUuid)
    if (!message) {
      return false
    }

    const isAuthorized = message.senderUuid === dto.originatorUuid || message.userUuid === dto.originatorUuid
    if (!isAuthorized) {
      return false
    }

    await this.asymmetricMessageRepository.remove(message)

    return true
  }
}

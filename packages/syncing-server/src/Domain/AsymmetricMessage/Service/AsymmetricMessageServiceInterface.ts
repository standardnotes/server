import { UpdateAsymmetricMessageDTO } from './UpdateAsymmetricMessageDTO'
import { AsymmetricMessage } from '../Model/AsymmetricMessage'
import { GetUserAsymmetricMessagesDTO } from './GetUserAsymmetricMessagesDTO'
import { CreateAsymmetricMessageDTO } from './CreateAsymmetricMessageDTO'

export interface AsymmetricMessageServiceInterface {
  createMessage(dto: CreateAsymmetricMessageDTO): Promise<AsymmetricMessage | null>
  updateMessage(dto: UpdateAsymmetricMessageDTO): Promise<AsymmetricMessage | null>

  getMessagesForUser(dto: GetUserAsymmetricMessagesDTO): Promise<AsymmetricMessage[]>
  getOutboundMessagesForUser(dto: { userUuid: string }): Promise<AsymmetricMessage[]>

  deleteAllInboundMessages(dto: { userUuid: string }): Promise<void>
  deleteMessage(dto: { originatorUuid: string; messageUuid: string }): Promise<boolean>
}

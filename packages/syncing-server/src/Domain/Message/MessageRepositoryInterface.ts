import { Uuid } from '@standardnotes/domain-core'

import { Message } from './Message'

export interface MessageRepositoryInterface {
  findByUuid: (uuid: Uuid) => Promise<Message | null>
  findByRecipientUuid: (uuid: Uuid) => Promise<Message[]>
  findBySenderUuid: (uuid: Uuid) => Promise<Message[]>
  findByRecipientUuidAndReplaceabilityIdentifier: (dto: {
    recipientUuid: Uuid
    replaceabilityIdentifier: string
  }) => Promise<Message | null>
  save(message: Message): Promise<void>
  remove(message: Message): Promise<void>
}

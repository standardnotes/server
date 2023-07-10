import { Uuid } from '@standardnotes/domain-core'

import { Message } from './Message'

export interface MessageRepositoryInterface {
  findByUuid: (uuid: Uuid) => Promise<Message | null>
  findByRecipientUuidAndReplaceabilityIdentifier: (dto: {
    recipientUuid: Uuid
    replaceabilityIdentifier: string
  }) => Promise<Message | null>
  save(message: Message): Promise<void>
  remove(message: Message): Promise<void>
}

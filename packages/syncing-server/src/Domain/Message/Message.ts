import { Entity, Result, UniqueEntityId } from '@standardnotes/domain-core'

import { MessageProps } from './MessageProps'

export class Message extends Entity<MessageProps> {
  private constructor(props: MessageProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: MessageProps, id?: UniqueEntityId): Result<Message> {
    return Result.ok<Message>(new Message(props, id))
  }
}

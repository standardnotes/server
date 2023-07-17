import { Entity, Result, UniqueEntityId } from '@standardnotes/domain-core'

import { NotificationProps } from './NotificationProps'

export class Notification extends Entity<NotificationProps> {
  private constructor(props: NotificationProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: NotificationProps, id?: UniqueEntityId): Result<Notification> {
    return Result.ok<Notification>(new Notification(props, id))
  }
}

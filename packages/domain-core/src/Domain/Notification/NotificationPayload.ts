import { ValueObject } from '../Core/ValueObject'
import { Result } from '../Core/Result'

import { NotificationPayloadProps } from './NotificationPayloadProps'
import { NotificationType } from './NotificationType'

export class NotificationPayload extends ValueObject<NotificationPayloadProps> {
  private constructor(props: NotificationPayloadProps) {
    super(props)
  }

  override toString(): string {
    return JSON.stringify(this.props)
  }

  static createFromString(jsonPayload: string): Result<NotificationPayload> {
    try {
      const props = JSON.parse(jsonPayload)

      return NotificationPayload.create(props)
    } catch (error) {
      return Result.fail<NotificationPayload>((error as Error).message)
    }
  }

  static create(props: NotificationPayloadProps): Result<NotificationPayload> {
    if (
      props.itemUuid === undefined &&
      props.type.equals(NotificationType.create(NotificationType.TYPES.SharedVaultItemRemoved).getValue())
    ) {
      return Result.fail<NotificationPayload>(
        `Item uuid is required for ${NotificationType.TYPES.SharedVaultItemRemoved} notification type`,
      )
    }

    return Result.ok<NotificationPayload>(new NotificationPayload(props))
  }
}

import { ValueObject } from '../Core/ValueObject'
import { Result } from '../Core/Result'

import { NotificationPayloadProps } from './NotificationPayloadProps'
import { NotificationType } from './NotificationType'
import { Uuid } from '../Common/Uuid'

export class NotificationPayload extends ValueObject<NotificationPayloadProps> {
  private constructor(props: NotificationPayloadProps) {
    super(props)
  }

  override toString(): string {
    return JSON.stringify({
      version: this.props.version,
      type: this.props.type.value,
      sharedVaultUuid: this.props.sharedVaultUuid.value,
      itemUuid: this.props.itemUuid ? this.props.itemUuid.value : undefined,
    })
  }

  static createFromString(jsonPayload: string): Result<NotificationPayload> {
    try {
      const props = JSON.parse(jsonPayload)

      const typeOrError = NotificationType.create(props.type)
      if (typeOrError.isFailed()) {
        return Result.fail<NotificationPayload>(typeOrError.getError())
      }
      const type = typeOrError.getValue()

      const sharedVaultUuidOrError = Uuid.create(props.sharedVaultUuid)
      if (sharedVaultUuidOrError.isFailed()) {
        return Result.fail<NotificationPayload>(sharedVaultUuidOrError.getError())
      }
      const sharedVaultUuid = sharedVaultUuidOrError.getValue()

      let itemUuid: Uuid | undefined = undefined
      if (props.itemUuid) {
        const itemUuidOrError = Uuid.create(props.itemUuid)
        if (itemUuidOrError.isFailed()) {
          return Result.fail<NotificationPayload>(itemUuidOrError.getError())
        }
        itemUuid = itemUuidOrError.getValue()
      }

      return NotificationPayload.create({
        version: props.version,
        type,
        sharedVaultUuid,
        itemUuid,
      })
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

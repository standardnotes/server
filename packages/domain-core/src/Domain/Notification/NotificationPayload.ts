import { ValueObject } from '../Core/ValueObject'
import { Result } from '../Core/Result'

import { NotificationPayloadProps } from './NotificationPayloadProps'
import { NotificationType } from './NotificationType'
import { Uuid } from '../Common/Uuid'
import { NotificationPayloadIdentifierType } from './NotificationPayloadIdentifierType'

export class NotificationPayload extends ValueObject<NotificationPayloadProps> {
  private constructor(props: NotificationPayloadProps) {
    super(props)
  }

  override toString(): string {
    return JSON.stringify({
      version: this.props.version,
      type: this.props.type.value,
      primaryIdentifier: this.props.primaryIdentifier.value,
      primaryIndentifierType: this.props.primaryIndentifierType.value,
      secondaryIdentifier: this.props.secondaryIdentifier?.value,
      secondaryIdentifierType: this.props.secondaryIdentifierType?.value,
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

      const primaryIdentifierOrError = Uuid.create(props.primaryIdentifier)
      if (primaryIdentifierOrError.isFailed()) {
        return Result.fail<NotificationPayload>(primaryIdentifierOrError.getError())
      }
      const primaryIdentifier = primaryIdentifierOrError.getValue()

      const primaryIndentifierTypeOrError = NotificationPayloadIdentifierType.create(props.primaryIndentifierType)
      if (primaryIndentifierTypeOrError.isFailed()) {
        return Result.fail<NotificationPayload>(primaryIndentifierTypeOrError.getError())
      }
      const primaryIndentifierType = primaryIndentifierTypeOrError.getValue()

      let secondaryIdentifier: Uuid | undefined
      if (props.secondaryIdentifier) {
        const secondaryIdentifierOrError = Uuid.create(props.secondaryIdentifier)
        if (secondaryIdentifierOrError.isFailed()) {
          return Result.fail<NotificationPayload>(secondaryIdentifierOrError.getError())
        }
        secondaryIdentifier = secondaryIdentifierOrError.getValue()
      }

      let secondaryIdentifierType: NotificationPayloadIdentifierType | undefined
      if (props.secondaryIdentifierType) {
        const secondaryIdentifierTypeOrError = NotificationPayloadIdentifierType.create(props.secondaryIdentifierType)
        if (secondaryIdentifierTypeOrError.isFailed()) {
          return Result.fail<NotificationPayload>(secondaryIdentifierTypeOrError.getError())
        }
        secondaryIdentifierType = secondaryIdentifierTypeOrError.getValue()
      }

      return NotificationPayload.create({
        version: props.version,
        type,
        primaryIdentifier,
        primaryIndentifierType,
        secondaryIdentifier,
        secondaryIdentifierType,
      })
    } catch (error) {
      return Result.fail<NotificationPayload>((error as Error).message)
    }
  }

  static create(props: NotificationPayloadProps): Result<NotificationPayload> {
    if (
      props.secondaryIdentifier === undefined &&
      props.type.equals(NotificationType.create(NotificationType.TYPES.SharedVaultItemRemoved).getValue())
    ) {
      return Result.fail<NotificationPayload>(
        `Item uuid is required for ${NotificationType.TYPES.SharedVaultItemRemoved} notification type`,
      )
    }

    return Result.ok<NotificationPayload>(new NotificationPayload(props))
  }
}

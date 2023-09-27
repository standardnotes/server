import { Result } from '../Core/Result'
import { ValueObject } from '../Core/ValueObject'
import { NotificationPayloadIdentifierTypeProps } from './NotificationPayloadIdentifierTypeProps'

export class NotificationPayloadIdentifierType extends ValueObject<NotificationPayloadIdentifierTypeProps> {
  static readonly TYPES = {
    SharedVaultUuid: 'shared_vault_uuid',
    UserUuid: 'user_uuid',
    SharedVaultInviteUuid: 'shared_vault_invite_uuid',
    ItemUuid: 'item_uuid',
  }

  private constructor(props: NotificationPayloadIdentifierTypeProps) {
    super(props)
  }

  get value(): string {
    return this.props.value
  }

  static create(type: string): Result<NotificationPayloadIdentifierType> {
    if (!Object.values(this.TYPES).includes(type)) {
      return Result.fail<NotificationPayloadIdentifierType>(`Invalid notification payload identifier type: ${type}`)
    }

    return Result.ok<NotificationPayloadIdentifierType>(new NotificationPayloadIdentifierType({ value: type }))
  }
}

import { ValueObject, Result } from '@standardnotes/domain-core'

import { NotificationTypeProps } from './NotificationTypeProps'

export class NotificationType extends ValueObject<NotificationTypeProps> {
  static readonly TYPES = {
    SharedVaultItemRemoved: 'shared_vault_item_removed',
    RemovedFromSharedVault: 'removed_from_shared_vault',
  }

  get value(): string {
    return this.props.value
  }

  private constructor(props: NotificationTypeProps) {
    super(props)
  }

  static create(notificationType: string): Result<NotificationType> {
    const isValidPermission = Object.values(this.TYPES).includes(notificationType)
    if (!isValidPermission) {
      return Result.fail<NotificationType>(`Invalid shared vault user permission ${notificationType}`)
    } else {
      return Result.ok<NotificationType>(new NotificationType({ value: notificationType }))
    }
  }
}

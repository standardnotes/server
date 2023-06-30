import { Result, ValueObject } from '@standardnotes/domain-core'

import { SharedVaultUserPermissionProps } from './SharedVaultUserPermissionProps'

export class SharedVaultUserPermission extends ValueObject<SharedVaultUserPermissionProps> {
  get value(): string {
    return this.props.value
  }

  private constructor(props: SharedVaultUserPermissionProps) {
    super(props)
  }

  static create(sharedVaultUserPermission: string): Result<SharedVaultUserPermission> {
    if (!['read', 'write', 'admin'].includes(sharedVaultUserPermission)) {
      return Result.fail<SharedVaultUserPermission>(`Invalid shared vault user permission ${sharedVaultUserPermission}`)
    } else {
      return Result.ok<SharedVaultUserPermission>(new SharedVaultUserPermission({ value: sharedVaultUserPermission }))
    }
  }
}

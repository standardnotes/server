import { Result } from '../Core/Result'
import { ValueObject } from '../Core/ValueObject'

import { SharedVaultUserPermissionProps } from './SharedVaultUserPermissionProps'

export class SharedVaultUserPermission extends ValueObject<SharedVaultUserPermissionProps> {
  static readonly PERMISSIONS = {
    Read: 'read',
    Write: 'write',
    Admin: 'admin',
  }

  get value(): string {
    return this.props.value
  }

  private constructor(props: SharedVaultUserPermissionProps) {
    super(props)
  }

  static create(sharedVaultUserPermission: string): Result<SharedVaultUserPermission> {
    const isValidPermission = Object.values(this.PERMISSIONS).includes(sharedVaultUserPermission)
    if (!isValidPermission) {
      return Result.fail<SharedVaultUserPermission>(`Invalid shared vault user permission ${sharedVaultUserPermission}`)
    } else {
      return Result.ok<SharedVaultUserPermission>(new SharedVaultUserPermission({ value: sharedVaultUserPermission }))
    }
  }
}

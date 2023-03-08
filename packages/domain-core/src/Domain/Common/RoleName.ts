import { ValueObject } from '../Core/ValueObject'
import { Result } from '../Core/Result'
import { RoleNameProps } from './RoleNameProps'

export class RoleName extends ValueObject<RoleNameProps> {
  static readonly NAMES = {
    CoreUser: 'CORE_USER',
    PlusUser: 'PLUS_USER',
    ProUser: 'PRO_USER',
    InternalTeamUser: 'INTERNAL_TEAM_USER',
  }

  get value(): string {
    return this.props.value
  }

  hasMoreOrEqualPowerTo(roleName: RoleName): boolean {
    switch (this.value) {
      case RoleName.NAMES.InternalTeamUser:
        return true
      case RoleName.NAMES.ProUser:
        return [RoleName.NAMES.CoreUser, RoleName.NAMES.PlusUser, RoleName.NAMES.ProUser].includes(roleName.value)
      case RoleName.NAMES.PlusUser:
        return [RoleName.NAMES.CoreUser, RoleName.NAMES.PlusUser].includes(roleName.value)
      case RoleName.NAMES.CoreUser:
        return [RoleName.NAMES.CoreUser].includes(roleName.value)
      /*istanbul ignore next*/
      default:
        throw new Error(`Invalid role name: ${this.value}`)
    }
  }

  private constructor(props: RoleNameProps) {
    super(props)
  }

  static create(name: string): Result<RoleName> {
    const isValidName = Object.values(this.NAMES).includes(name)
    if (!isValidName) {
      return Result.fail<RoleName>(`Invalid role name: ${name}`)
    } else {
      return Result.ok<RoleName>(new RoleName({ value: name }))
    }
  }
}

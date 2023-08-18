import { ValueObject } from '../Core/ValueObject'
import { Result } from '../Core/Result'
import { RoleNameCollectionProps } from './RoleNameCollectionProps'
import { RoleName } from './RoleName'

export class RoleNameCollection extends ValueObject<RoleNameCollectionProps> {
  get value(): RoleName[] {
    return this.props.value
  }

  includes(roleName: RoleName): boolean {
    for (const existingRoleName of this.props.value) {
      if (existingRoleName.value === roleName.value) {
        return true
      }
    }

    return false
  }

  hasARoleNameWithMoreOrEqualPowerTo(roleName: RoleName): boolean {
    for (const existingRoleName of this.props.value) {
      if (existingRoleName.hasMoreOrEqualPowerTo(roleName)) {
        return true
      }
    }

    return false
  }

  override equals(roleNameCollection: RoleNameCollection): boolean {
    if (this.props.value.length !== roleNameCollection.value.length) {
      return false
    }

    for (const roleName of roleNameCollection.value) {
      if (!this.includes(roleName)) {
        return false
      }
    }

    return true
  }

  private constructor(props: RoleNameCollectionProps) {
    super(props)
  }

  static create(roleNameStrings: string[]): Result<RoleNameCollection> {
    const roleNames: RoleName[] = []
    for (const roleNameString of roleNameStrings) {
      const roleNameOrError = RoleName.create(roleNameString)
      if (roleNameOrError.isFailed()) {
        return Result.fail<RoleNameCollection>(roleNameOrError.getError())
      }
      roleNames.push(roleNameOrError.getValue())
    }

    return Result.ok<RoleNameCollection>(new RoleNameCollection({ value: roleNames }))
  }
}
